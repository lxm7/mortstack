import ExpoModulesCore
import Clibsodium

// Thin Swift wrapper over libsodium C symbols. We deliberately do NOT depend
// on the jedisct1/swift-sodium Swift package — its last CocoaPods release
// (0.9.1, Dec 2020) shipped a stale xcframework that fails to link on
// Apple-Silicon iOS simulators, and the project has since gone SPM-only.
// We vendor a fresh Clibsodium.xcframework instead and call libsodium
// directly, which is all our ~7-function surface needs.

// MARK: - Errors

private enum ChatCryptoError: Error, CustomStringConvertible {
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
    }
  }
}

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
}
