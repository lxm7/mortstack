import ExpoModulesCore
import Clibsodium

// Thin Swift wrapper over libsodium C symbols. We deliberately do NOT depend
// on the jedisct1/swift-sodium Swift package — its last CocoaPods release
// (0.9.1, Dec 2020) shipped a stale xcframework that fails to link on
// Apple-Silicon iOS simulators, and the project has since gone SPM-only.
// We vendor a fresh Clibsodium.xcframework instead and call libsodium
// directly, which is all our ~7-function surface needs.

// MARK: - Errors

private enum ChatCryptoError: Error, LocalizedError, CustomStringConvertible {
  case sodiumInitFailed
  case invalidSeedLength(Int)
  case invalidPublicKeyLength(Int)
  case invalidNonceLength(Int)
  case invalidSignatureLength(Int)
  case ciphertextTooShort(Int)
  case keypairDerivationFailed(String)
  case encryptionFailed
  case decryptionFailed
  case signFailed
  case hashFailed
  case keychainError(OSStatus)
  case signalNotImplemented(String)

  var description: String {
    switch self {
    case .sodiumInitFailed:
      return "sodium_init() returned -1"
    case .invalidSeedLength(let n):
      return "seed must be 32 bytes, got \(n)"
    case .invalidPublicKeyLength(let n):
      return "public key must be 32 bytes, got \(n)"
    case .invalidNonceLength(let n):
      return "nonce must be 24 bytes, got \(n)"
    case .invalidSignatureLength(let n):
      return "signature must be 64 bytes, got \(n)"
    case .ciphertextTooShort(let n):
      return "ciphertext must be at least 17 bytes, got \(n)"
    case .keypairDerivationFailed(let which):
      return "\(which) keypair derivation failed"
    case .encryptionFailed:
      return "crypto_box_easy failed"
    case .decryptionFailed:
      return "crypto_box_open_easy failed — bad key, bad nonce, or tampered ciphertext"
    case .signFailed:
      return "crypto_sign_detached failed"
    case .hashFailed:
      return "crypto_generichash failed"
    case .keychainError(let status):
      return "Keychain SecItem call failed with OSStatus \(status)"
    case .signalNotImplemented(let name):
      return "M3.5 \(name) not yet implemented (chunk 1C pending)"
    }
  }

  // LocalizedError → bridges to NSError.localizedDescription so the JS-side
  // sees the real message instead of "<EnumType> error <ordinal>".
  var errorDescription: String? { description }
}

// MARK: - Keychain constants

// Service name pins the alias the README §M3 spec mandates. Bumping the v1
// suffix is a destructive identity rotation — coordinate with chat-db key
// versioning before changing.
private let SEED_KEYCHAIN_SERVICE = "chat-identity-seed-v1"
private let SEED_KEYCHAIN_ACCOUNT = "default"

// Shared keychain access group suffix. iOS keychain APIs need the FULL
// access-group string ("<TEAMID>.io.sessions.chat") at write/read time.
// The team prefix is discovered at runtime from the keychain itself —
// see `resolvedSeedAccessGroup()` below.
private let SEED_KEYCHAIN_ACCESS_GROUP_SUFFIX = "io.sessions.chat"

// MARK: - Sizes

private let SEED_BYTES = 32
private let PUBLIC_KEY_BYTES = 32
private let SIGN_SECRET_KEY_BYTES = 64
private let BOX_SECRET_KEY_BYTES = 32
private let NONCE_BYTES = 24
private let SIGNATURE_BYTES = 64
private let MAC_BYTES = 16

// Domain-separation tag for X25519 sub-seed derivation. Must match
// `X25519_DERIVATION_CONTEXT` in ChatCryptoModule.kt exactly. Bumping the
// version suffix is a breaking key-identity migration — do not change casually.
private let X25519_CONTEXT: [UInt8] = Array("sessions/x25519/v1".utf8)

// MARK: - Module

public class ChatCryptoModule: Module {
  private var initialized = false

  public func definition() -> ModuleDefinition {
    Name("ChatCrypto")

    OnCreate {
      // sodium_init is thread-safe to call multiple times: returns 0 on first
      // success, 1 if already initialized, -1 on hard failure.
      let rc = sodium_init()
      if rc < 0 {
        // Defer the error until a function is actually invoked so module
        // construction does not crash the entire RN bridge.
        self.initialized = false
      } else {
        self.initialized = true
      }
    }

    Function("generateIdentitySeed") { () throws -> Data in
      try self.ensureInit()
      return try self.randomBytes(SEED_BYTES)
    }

    Function("derivePublicKeys") { (seed: Data) throws -> [String: Data] in
      try self.ensureInit()
      try self.require(seed, expected: SEED_BYTES, name: "seed")

      let (signPub, _) = try self.deriveSignKeypair(seed: seed)
      let (boxPub, _) = try self.deriveBoxKeypair(seed: seed)
      return [
        "ed25519Pub": signPub,
        "x25519Pub": boxPub,
      ]
    }

    Function("box") {
      (plaintext: Data, peerX25519Pub: Data, seed: Data) throws -> [String: Data] in
      try self.ensureInit()
      try self.require(seed, expected: SEED_BYTES, name: "seed")
      try self.require(peerX25519Pub, expected: PUBLIC_KEY_BYTES, name: "peerX25519Pub")
      let (_, mySecret) = try self.deriveBoxKeypair(seed: seed)

      let nonce = try self.randomBytes(NONCE_BYTES)
      var cipher = Data(count: plaintext.count + MAC_BYTES)
      let rc = cipher.withUnsafeMutableBytes { (cPtr: UnsafeMutableRawBufferPointer) -> Int32 in
        plaintext.withUnsafeBytes { (pPtr: UnsafeRawBufferPointer) -> Int32 in
          nonce.withUnsafeBytes { (nPtr: UnsafeRawBufferPointer) -> Int32 in
            peerX25519Pub.withUnsafeBytes { (pkPtr: UnsafeRawBufferPointer) -> Int32 in
              mySecret.withUnsafeBytes { (skPtr: UnsafeRawBufferPointer) -> Int32 in
                crypto_box_easy(
                  cPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  pPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  UInt64(plaintext.count),
                  nPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  pkPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  skPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
                )
              }
            }
          }
        }
      }
      if rc != 0 { throw ChatCryptoError.encryptionFailed }
      return ["ciphertext": cipher, "nonce": nonce]
    }

    Function("boxOpen") {
      (ciphertext: Data, nonce: Data, peerX25519Pub: Data, seed: Data) throws -> Data in
      try self.ensureInit()
      try self.require(seed, expected: SEED_BYTES, name: "seed")
      try self.require(peerX25519Pub, expected: PUBLIC_KEY_BYTES, name: "peerX25519Pub")
      try self.require(nonce, expected: NONCE_BYTES, name: "nonce")
      if ciphertext.count < MAC_BYTES + 1 {
        throw ChatCryptoError.ciphertextTooShort(ciphertext.count)
      }
      let (_, mySecret) = try self.deriveBoxKeypair(seed: seed)

      var plain = Data(count: ciphertext.count - MAC_BYTES)
      let rc = plain.withUnsafeMutableBytes { (mPtr: UnsafeMutableRawBufferPointer) -> Int32 in
        ciphertext.withUnsafeBytes { (cPtr: UnsafeRawBufferPointer) -> Int32 in
          nonce.withUnsafeBytes { (nPtr: UnsafeRawBufferPointer) -> Int32 in
            peerX25519Pub.withUnsafeBytes { (pkPtr: UnsafeRawBufferPointer) -> Int32 in
              mySecret.withUnsafeBytes { (skPtr: UnsafeRawBufferPointer) -> Int32 in
                crypto_box_open_easy(
                  mPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  cPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  UInt64(ciphertext.count),
                  nPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  pkPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
                  skPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
                )
              }
            }
          }
        }
      }
      if rc != 0 { throw ChatCryptoError.decryptionFailed }
      return plain
    }

    Function("signDetached") { (message: Data, seed: Data) throws -> Data in
      try self.ensureInit()
      try self.require(seed, expected: SEED_BYTES, name: "seed")
      let (_, signSecret) = try self.deriveSignKeypair(seed: seed)

      var sig = Data(count: SIGNATURE_BYTES)
      let rc = sig.withUnsafeMutableBytes { (sPtr: UnsafeMutableRawBufferPointer) -> Int32 in
        message.withUnsafeBytes { (mPtr: UnsafeRawBufferPointer) -> Int32 in
          signSecret.withUnsafeBytes { (skPtr: UnsafeRawBufferPointer) -> Int32 in
            crypto_sign_detached(
              sPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              nil,
              mPtr.baseAddress?.assumingMemoryBound(to: UInt8.self),
              UInt64(message.count),
              skPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
            )
          }
        }
      }
      if rc != 0 { throw ChatCryptoError.signFailed }
      return sig
    }

    Function("verifyDetached") {
      (message: Data, signature: Data, peerEd25519Pub: Data) throws -> Bool in
      try self.ensureInit()
      try self.require(peerEd25519Pub, expected: PUBLIC_KEY_BYTES, name: "peerEd25519Pub")
      try self.require(signature, expected: SIGNATURE_BYTES, name: "signature")

      let rc = signature.withUnsafeBytes { (sPtr: UnsafeRawBufferPointer) -> Int32 in
        message.withUnsafeBytes { (mPtr: UnsafeRawBufferPointer) -> Int32 in
          peerEd25519Pub.withUnsafeBytes { (pkPtr: UnsafeRawBufferPointer) -> Int32 in
            crypto_sign_verify_detached(
              sPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              mPtr.baseAddress?.assumingMemoryBound(to: UInt8.self),
              UInt64(message.count),
              pkPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
            )
          }
        }
      }
      return rc == 0
    }

    Function("randomNonce") { () throws -> Data in
      try self.ensureInit()
      return try self.randomBytes(NONCE_BYTES)
    }

    // MARK: - Seed persistence (iOS Keychain, shared access group)

    Function("saveSeed") { (seed: Data) throws -> Void in
      try self.ensureInit()
      try self.require(seed, expected: SEED_BYTES, name: "seed")
      try self.keychainSaveSeed(seed)
    }

    Function("loadSeed") { () throws -> Data? in
      try self.ensureInit()
      return try self.keychainLoadSeed()
    }

    Function("clearSeed") { () throws -> Bool in
      try self.ensureInit()
      return try self.keychainClearSeed()
    }

    // MARK: - M3.5 Signal Protocol stubs (chunk 1C wires libsignal)

    Function("signalGenerateRegistrationId") { () throws -> Int in
      throw ChatCryptoError.signalNotImplemented("signalGenerateRegistrationId")
    }

    Function("signalCreateBundle") {
      (_ regId: Int, _ signedId: Int, _ otpkBase: Int, _ otpkCount: Int, _ kyberId: Int)
        throws -> [String: Any] in
      throw ChatCryptoError.signalNotImplemented("signalCreateBundle")
    }

    Function("signalProcessPreKeyBundle") {
      (_ address: [String: Any], _ bundle: [String: Any]) throws -> Void in
      throw ChatCryptoError.signalNotImplemented("signalProcessPreKeyBundle")
    }

    Function("signalEncrypt") {
      (_ address: [String: Any], _ plaintext: Data) throws -> [String: Any] in
      throw ChatCryptoError.signalNotImplemented("signalEncrypt")
    }

    Function("signalDecrypt") {
      (_ address: [String: Any], _ ciphertext: [String: Any]) throws -> Data in
      throw ChatCryptoError.signalNotImplemented("signalDecrypt")
    }

    Function("signalHasSession") { (_ address: [String: Any]) throws -> Bool in
      throw ChatCryptoError.signalNotImplemented("signalHasSession")
    }

    Function("signalDeleteSession") { (_ address: [String: Any]) throws -> Void in
      throw ChatCryptoError.signalNotImplemented("signalDeleteSession")
    }

    Function("signalRemainingOneTimePreKeys") { () throws -> Int in
      throw ChatCryptoError.signalNotImplemented("signalRemainingOneTimePreKeys")
    }
  }

  // MARK: - Helpers

  private func ensureInit() throws {
    if !initialized {
      let rc = sodium_init()
      if rc < 0 { throw ChatCryptoError.sodiumInitFailed }
      initialized = true
    }
  }

  private func require(_ d: Data, expected: Int, name: String) throws {
    if d.count != expected {
      switch name {
      case "seed": throw ChatCryptoError.invalidSeedLength(d.count)
      case "nonce": throw ChatCryptoError.invalidNonceLength(d.count)
      case "signature": throw ChatCryptoError.invalidSignatureLength(d.count)
      default: throw ChatCryptoError.invalidPublicKeyLength(d.count)
      }
    }
  }

  private func randomBytes(_ n: Int) throws -> Data {
    var buf = Data(count: n)
    buf.withUnsafeMutableBytes { (ptr: UnsafeMutableRawBufferPointer) in
      randombytes_buf(ptr.baseAddress!, n)
    }
    return buf
  }

  private func deriveSignKeypair(seed: Data) throws -> (pub: Data, sec: Data) {
    var pub = Data(count: PUBLIC_KEY_BYTES)
    var sec = Data(count: SIGN_SECRET_KEY_BYTES)
    let rc = pub.withUnsafeMutableBytes { (pPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      sec.withUnsafeMutableBytes { (sPtr: UnsafeMutableRawBufferPointer) -> Int32 in
        seed.withUnsafeBytes { (seedPtr: UnsafeRawBufferPointer) -> Int32 in
          crypto_sign_seed_keypair(
            pPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            sPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            seedPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
          )
        }
      }
    }
    if rc != 0 { throw ChatCryptoError.keypairDerivationFailed("ed25519") }
    return (pub, sec)
  }

  // X25519 sub-seed = BLAKE2b(seed, key=X25519_CONTEXT, outLen=32).
  // Domain-separated from the Ed25519 key so a leak of one does not compromise
  // the other and so future schemes (per-chat keys, prekey bundles) can layer
  // on the same master seed with different contexts.
  private func deriveBoxKeypair(seed: Data) throws -> (pub: Data, sec: Data) {
    var subSeed = Data(count: SEED_BYTES)
    let hashRc = subSeed.withUnsafeMutableBytes { (oPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      seed.withUnsafeBytes { (sPtr: UnsafeRawBufferPointer) -> Int32 in
        X25519_CONTEXT.withUnsafeBufferPointer { (kPtr: UnsafeBufferPointer<UInt8>) -> Int32 in
          crypto_generichash(
            oPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            SEED_BYTES,
            sPtr.baseAddress?.assumingMemoryBound(to: UInt8.self),
            UInt64(seed.count),
            kPtr.baseAddress,
            X25519_CONTEXT.count
          )
        }
      }
    }
    if hashRc != 0 { throw ChatCryptoError.hashFailed }

    var pub = Data(count: PUBLIC_KEY_BYTES)
    var sec = Data(count: BOX_SECRET_KEY_BYTES)
    let kpRc = pub.withUnsafeMutableBytes { (pPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      sec.withUnsafeMutableBytes { (sPtr: UnsafeMutableRawBufferPointer) -> Int32 in
        subSeed.withUnsafeBytes { (seedPtr: UnsafeRawBufferPointer) -> Int32 in
          crypto_box_seed_keypair(
            pPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            sPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            seedPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
          )
        }
      }
    }
    if kpRc != 0 { throw ChatCryptoError.keypairDerivationFailed("x25519") }
    return (pub, sec)
  }

  // MARK: - Keychain helpers

  // Cached "<TEAMID>.io.sessions.chat" — resolved once on first use, since
  // the team prefix doesn't change for the lifetime of the process.
  private static var cachedAccessGroup: String?

  private func keychainBaseQuery() throws -> [String: Any] {
    return [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: SEED_KEYCHAIN_SERVICE,
      kSecAttrAccount as String: SEED_KEYCHAIN_ACCOUNT,
      kSecAttrAccessGroup as String: try resolvedSeedAccessGroup(),
    ]
  }

  // Discover the team prefix by adding a throwaway keychain item without an
  // explicit access group, reading back its assigned kSecAttrAccessGroup
  // (which iOS fills in as "<TEAMID>.<defaultBundle>"), and splitting on the
  // first dot. Standard pattern documented widely in iOS SDK discussions.
  private func resolvedSeedAccessGroup() throws -> String {
    if let cached = Self.cachedAccessGroup { return cached }

    let probeQuery: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: "io.sessions.chat.prefix-probe",
      kSecAttrAccount as String: "probe",
    ]
    SecItemDelete(probeQuery as CFDictionary)

    var addAttrs = probeQuery
    addAttrs[kSecValueData as String] = Data([0x00])
    addAttrs[kSecReturnAttributes as String] = true
    addAttrs[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

    var result: CFTypeRef?
    let addStatus = SecItemAdd(addAttrs as CFDictionary, &result)
    defer { SecItemDelete(probeQuery as CFDictionary) }

    guard addStatus == errSecSuccess,
      let attrs = result as? [String: Any],
      let assignedGroup = attrs[kSecAttrAccessGroup as String] as? String,
      let prefix = assignedGroup.split(separator: ".").first
    else {
      throw ChatCryptoError.keychainError(addStatus)
    }

    let full = "\(prefix).\(SEED_KEYCHAIN_ACCESS_GROUP_SUFFIX)"
    Self.cachedAccessGroup = full
    return full
  }

  private func keychainSaveSeed(_ seed: Data) throws {
    var add = try keychainBaseQuery()
    add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    add[kSecValueData as String] = seed

    let addStatus = SecItemAdd(add as CFDictionary, nil)
    if addStatus == errSecSuccess { return }

    // Existing item → overwrite. Update the value + accessibility together so
    // a stale accessibility class from an earlier install can't pin the item.
    if addStatus == errSecDuplicateItem {
      let update: [String: Any] = [
        kSecValueData as String: seed,
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
      ]
      let updStatus = SecItemUpdate(try keychainBaseQuery() as CFDictionary, update as CFDictionary)
      if updStatus != errSecSuccess {
        throw ChatCryptoError.keychainError(updStatus)
      }
      return
    }

    throw ChatCryptoError.keychainError(addStatus)
  }

  private func keychainLoadSeed() throws -> Data? {
    var query = try keychainBaseQuery()
    query[kSecReturnData as String] = true
    query[kSecMatchLimit as String] = kSecMatchLimitOne

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    if status == errSecItemNotFound { return nil }
    if status != errSecSuccess { throw ChatCryptoError.keychainError(status) }
    guard let data = item as? Data else { return nil }
    return data
  }

  private func keychainClearSeed() throws -> Bool {
    let status = SecItemDelete(try keychainBaseQuery() as CFDictionary)
    if status == errSecSuccess { return true }
    if status == errSecItemNotFound { return false }
    throw ChatCryptoError.keychainError(status)
  }
}
