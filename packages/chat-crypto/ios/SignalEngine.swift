import Foundation
import Clibsodium

// Orchestrator for the 8 signal* methods exposed by ChatCryptoModule.swift.
// Owns the per-install SignalStore and the 5 store-protocol wrappers.
//
// Lifecycle:
//   - Constructed by ChatCryptoModule once at module-create time with a seed
//     provider closure (loads from the keychain helper).
//   - First Signal call lazily opens the SQLite store and rehydrates cached
//     identity (if signalCreateBundle was called on a previous install).
//   - signalCreateBundle is the explicit setup call — sets local identity,
//     persists registration id + identity keypair + prekey records.
//
// Identity derivation (M3.5 chunk 1C decision):
//   The libsignal identity is derived deterministically from the same 32-byte
//   seed M3 generated. We do NOT reuse the libsodium Ed25519 identity bytes
//   directly — libsodium's Ed25519 scalar and libsignal's Curve25519 scalar
//   are different mathematical objects from the same 32 random bytes, and
//   silently sharing them would produce two different public keys but couple
//   their failure modes. Instead we BLAKE2b the master seed with a domain
//   context ("sessions/signal-identity/v1") to get a fresh 32-byte sub-seed,
//   then hand it to libsignal's PrivateKey. Same single source of entropy,
//   no UX-visible re-onboarding, clean separation between protocol stacks.

private let SIGNAL_IDENTITY_CONTEXT: [UInt8] = Array("sessions/signal-identity/v1".utf8)
private let SIGNAL_STORE_KEY_CONTEXT: [UInt8] = Array("sessions/signal-store/v1".utf8)

private let SEED_BYTES = 32
private let SUBSEED_BYTES = 32

enum SignalEngineError: Error, LocalizedError, CustomStringConvertible {
  case seedNotInKeychain
  case hashFailed
  case engineNotInitialized
  case unexpectedCiphertextType(UInt8)
  case unexpectedCiphertextKind(String)
  case malformedAddress
  case malformedBundle(String)
  case malformedCiphertext

  var description: String {
    switch self {
    case .seedNotInKeychain:
      return "no identity seed in keychain — call generateIdentitySeed + saveSeed first"
    case .hashFailed:
      return "crypto_generichash failed during key derivation"
    case .engineNotInitialized:
      return "signal engine not initialized — call signalCreateBundle first"
    case .unexpectedCiphertextType(let rv):
      return "libsignal returned unexpected CiphertextMessage.MessageType rawValue=\(rv)"
    case .unexpectedCiphertextKind(let k):
      return "ciphertext kind must be 'pre-key' or 'whisper', got '\(k)'"
    case .malformedAddress:
      return "address dict must have {name: string, deviceId: number}"
    case .malformedBundle(let m):
      return "bundle dict malformed: \(m)"
    case .malformedCiphertext:
      return "ciphertext dict must have {kind: 'pre-key'|'whisper', serialized: bytes}"
    }
  }
  var errorDescription: String? { description }
}

final class SignalEngine {

  private let seedProvider: () throws -> Data?

  // Lazy. Nil until first Signal call; engineNotInitialized thrown for
  // encrypt/decrypt before signalCreateBundle was ever called on this device.
  private var store: SignalStore?
  private var sessionStore: SessionsSessionStore?
  private var identityKeyStore: SessionsIdentityKeyStore?
  private var preKeyStore: SessionsPreKeyStore?
  private var signedPreKeyStore: SessionsSignedPreKeyStore?
  private var kyberPreKeyStore: SessionsKyberPreKeyStore?

  // (localName, localDeviceId) — set by signalCreateBundle and rehydrated
  // from the store on engine reopen. Used as `localAddress` on every
  // signalEncrypt / signalDecryptPreKey / processPreKeyBundle.
  private var localAddress: ProtocolAddress?

  init(seedProvider: @escaping () throws -> Data?) {
    self.seedProvider = seedProvider
  }

  // MARK: - Public surface

  // Random uint32 for libsignal addressing. Caller persists alongside the
  // identity seed so it survives only if the seed does (a re-install gets
  // a new registration id, which is the desired Signal behavior).
  func signalGenerateRegistrationId() throws -> Int {
    var buf = [UInt8](repeating: 0, count: 4)
    buf.withUnsafeMutableBufferPointer { bptr in
      randombytes_buf(UnsafeMutableRawPointer(bptr.baseAddress!), 4)
    }
    // libsignal registration IDs are in [1, 0x3FFF] — strip high bits to stay
    // in range. Width = 14 bits.
    let raw = (UInt32(buf[0]) << 24) | (UInt32(buf[1]) << 16)
            | (UInt32(buf[2]) << 8)  |  UInt32(buf[3])
    return Int(raw & 0x3FFF)
  }

  // Generates the full local bundle. Sets local identity (name, deviceId,
  // registrationId, derived identity keypair) and persists prekeys.
  func signalCreateBundle(
    localName: String,
    localDeviceId: Int,
    registrationId: Int,
    signedPreKeyId: Int,
    oneTimePreKeyIdBase: Int,
    oneTimePreKeyCount: Int,
    kyberPreKeyId: Int
  ) throws -> [String: Any] {
    let seed = try requireSeed()
    let storeRef = try openStoreIfNeeded(seed: seed)

    let identity = try deriveSignalIdentityKeyPair(seed: seed)
    let regId = UInt32(registrationId)
    let localDev = UInt32(localDeviceId)

    // Persist local identity facts first — if any later step fails partway,
    // we want the next signalCreateBundle attempt to overwrite cleanly.
    try storeRef.setMeta(MetaKey.localName, Data(localName.utf8))
    try storeRef.setMeta(MetaKey.localDeviceId, leBytes(localDev))
    try storeRef.setMeta(MetaKey.registrationId, leBytes(regId))
    try storeRef.setMeta(MetaKey.identityKeyPair, identity.serialize())

    self.localAddress = try ProtocolAddress(name: localName, deviceId: localDev)
    self.identityKeyStore?.setLocalIdentity(identity, registrationId: regId)

    // Signed pre-key: fresh Curve25519 keypair signed by identity.
    let signedPreKeyPriv = PrivateKey.generate()
    let signedPreKeyPub = signedPreKeyPriv.publicKey
    let signedPreKeySig = identity.privateKey.generateSignature(
      message: signedPreKeyPub.serialize()
    )
    let signedRecord = try SignedPreKeyRecord(
      id: UInt32(signedPreKeyId),
      timestamp: UInt64(Date().timeIntervalSince1970 * 1000),
      privateKey: signedPreKeyPriv,
      signature: signedPreKeySig
    )
    try storeRef.storeSignedPreKey(UInt32(signedPreKeyId), signedRecord.serialize())

    // One-time pre-keys.
    var oneTimePublics: [[String: Any]] = []
    oneTimePublics.reserveCapacity(oneTimePreKeyCount)
    for i in 0..<oneTimePreKeyCount {
      let id = UInt32(oneTimePreKeyIdBase + i)
      let priv = PrivateKey.generate()
      let pub = priv.publicKey
      let record = try PreKeyRecord(id: id, publicKey: pub, privateKey: priv)
      try storeRef.storePreKey(id, record.serialize())
      oneTimePublics.append(["id": Int(id), "publicKey": pub.serialize()])
    }

    // Kyber pre-key (PQXDH post-quantum half): KEMKeyPair + identity signature
    // over the serialized public key.
    let kyberPair = KEMKeyPair.generate()
    let kyberPub = kyberPair.publicKey
    let kyberSig = identity.privateKey.generateSignature(message: kyberPub.serialize())
    let kyberRecord = try KyberPreKeyRecord(
      id: UInt32(kyberPreKeyId),
      timestamp: UInt64(Date().timeIntervalSince1970 * 1000),
      keyPair: kyberPair,
      signature: kyberSig
    )
    try storeRef.storeKyberPreKey(UInt32(kyberPreKeyId), kyberRecord.serialize())

    return [
      "identityKey": identity.publicKey.serialize(),
      "signedPreKey": [
        "id": signedPreKeyId,
        "publicKey": signedPreKeyPub.serialize(),
        "signature": signedPreKeySig,
      ],
      "oneTimePreKeys": oneTimePublics,
      "kyberPreKey": [
        "id": kyberPreKeyId,
        "publicKey": kyberPub.serialize(),
        "signature": kyberSig,
      ],
    ]
  }

  // Bootstrap outbound session against peer's published bundle.
  func signalProcessPreKeyBundle(address: [String: Any], bundle: [String: Any]) throws {
    try ensureInitialized()
    let peer = try parseAddress(address)
    let bundleObj = try parseBundle(bundle)
    try processPreKeyBundle(
      bundleObj,
      for: peer,
      ourAddress: localAddress!,
      sessionStore: sessionStore!,
      identityStore: identityKeyStore!,
      context: SessionsSignalStoreContext.shared
    )
  }

  // Encrypt for a specific peer device. Auto-routes pre-key vs whisper.
  //
  // The inner call is module-qualified `ChatCrypto.signalEncrypt(...)` to
  // disambiguate from this very instance method of the same name. Swift's
  // name lookup inside an instance method finds the member first and stops
  // — it won't fall through to top-level even on argument-label mismatch.
  // The vendored libsignal wrappers compile INTO our pod's Swift module
  // ("ChatCrypto"), so qualifying with that module name reaches the
  // top-level function without spinning back to self.
  func signalEncrypt(address: [String: Any], plaintext: Data) throws -> [String: Any] {
    try ensureInitialized()
    let peer = try parseAddress(address)
    let ciphertext: CiphertextMessage = try ChatCrypto.signalEncrypt(
      message: plaintext,
      for: peer,
      localAddress: localAddress!,
      sessionStore: sessionStore!,
      identityStore: identityKeyStore!,
      context: SessionsSignalStoreContext.shared
    )
    let kind: String
    let typeRaw = ciphertext.messageType.rawValue
    if typeRaw == CiphertextMessage.MessageType.preKey.rawValue {
      kind = "pre-key"
    } else if typeRaw == CiphertextMessage.MessageType.whisper.rawValue {
      kind = "whisper"
    } else {
      throw SignalEngineError.unexpectedCiphertextType(typeRaw)
    }
    return ["kind": kind, "serialized": ciphertext.serialize()]
  }

  func signalDecrypt(address: [String: Any], ciphertext: [String: Any]) throws -> Data {
    try ensureInitialized()
    let sender = try parseAddress(address)
    let (kind, serialized) = try parseCiphertext(ciphertext)
    switch kind {
    case "pre-key":
      let msg = try PreKeySignalMessage(bytes: serialized)
      return try signalDecryptPreKey(
        message: msg,
        from: sender,
        localAddress: localAddress!,
        sessionStore: sessionStore!,
        identityStore: identityKeyStore!,
        preKeyStore: preKeyStore!,
        signedPreKeyStore: signedPreKeyStore!,
        kyberPreKeyStore: kyberPreKeyStore!,
        context: SessionsSignalStoreContext.shared
      )
    case "whisper":
      let msg = try SignalMessage(bytes: serialized)
      // Module-qualified — see commentary on signalEncrypt above for why
      // bare `signalDecrypt(...)` resolves to this instance method instead
      // of the top-level vendored wrapper.
      return try ChatCrypto.signalDecrypt(
        message: msg,
        from: sender,
        to: localAddress!,
        sessionStore: sessionStore!,
        identityStore: identityKeyStore!,
        context: SessionsSignalStoreContext.shared
      )
    default:
      throw SignalEngineError.unexpectedCiphertextKind(kind)
    }
  }

  func signalHasSession(address: [String: Any]) throws -> Bool {
    let peer = try parseAddress(address)
    let storeRef = try openStoreIfNeeded(seed: try requireSeed())
    return try storeRef.hasSession(name: peer.name, deviceId: peer.deviceId)
  }

  func signalDeleteSession(address: [String: Any]) throws {
    let peer = try parseAddress(address)
    let storeRef = try openStoreIfNeeded(seed: try requireSeed())
    try storeRef.deleteSession(name: peer.name, deviceId: peer.deviceId)
  }

  func signalRemainingOneTimePreKeys() throws -> Int {
    let storeRef = try openStoreIfNeeded(seed: try requireSeed())
    return try storeRef.countPreKeys()
  }

  // MARK: - Lazy init

  // Open the SignalStore + construct all 5 store wrappers. Idempotent.
  // Rehydrates cached local identity if a prior signalCreateBundle persisted.
  @discardableResult
  private func openStoreIfNeeded(seed: Data) throws -> SignalStore {
    if let s = store { return s }
    let masterKey = try deriveStoreMasterKey(seed: seed)
    let dbPath = try storeDbPath()
    let s = try SignalStore(dbPath: dbPath, masterKey: masterKey)
    self.store = s
    self.sessionStore       = SessionsSessionStore(store: s)
    self.identityKeyStore   = SessionsIdentityKeyStore(store: s)
    self.preKeyStore        = SessionsPreKeyStore(store: s)
    self.signedPreKeyStore  = SessionsSignedPreKeyStore(store: s)
    self.kyberPreKeyStore   = SessionsKyberPreKeyStore(store: s)

    // Restore in-memory identity cache + local address from persisted meta.
    // Missing meta = no signalCreateBundle yet; rolls into engineNotInitialized
    // on the first encrypt/decrypt call.
    if let nameBlob = try s.getMeta(MetaKey.localName),
       let devBlob = try s.getMeta(MetaKey.localDeviceId), devBlob.count == 4 {
      let name = String(data: nameBlob, encoding: .utf8) ?? ""
      let dev = devBlob.withUnsafeBytes { $0.load(as: UInt32.self) }.littleEndian
      self.localAddress = try? ProtocolAddress(name: name, deviceId: dev)
    }
    if let regBlob = try s.getMeta(MetaKey.registrationId), regBlob.count == 4,
       let idBlob = try s.getMeta(MetaKey.identityKeyPair) {
      let reg = regBlob.withUnsafeBytes { $0.load(as: UInt32.self) }.littleEndian
      if let pair = try? IdentityKeyPair(bytes: idBlob) {
        self.identityKeyStore!.setLocalIdentity(pair, registrationId: reg)
      }
    }
    return s
  }

  private func ensureInitialized() throws {
    let seed = try requireSeed()
    try openStoreIfNeeded(seed: seed)
    if localAddress == nil {
      throw SignalEngineError.engineNotInitialized
    }
  }

  private func requireSeed() throws -> Data {
    guard let seed = try seedProvider(), seed.count == SEED_BYTES else {
      throw SignalEngineError.seedNotInKeychain
    }
    return seed
  }

  // MARK: - Key derivation

  // BLAKE2b(seed, key=context, outLen=32) — same primitive M3 uses for X25519
  // sub-seed derivation, different context string for domain separation.
  private func blake2bSubSeed(seed: Data, context: [UInt8]) throws -> Data {
    var out = Data(count: SUBSEED_BYTES)
    let rc = out.withUnsafeMutableBytes { (oPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      seed.withUnsafeBytes { (sPtr: UnsafeRawBufferPointer) -> Int32 in
        context.withUnsafeBufferPointer { (kPtr: UnsafeBufferPointer<UInt8>) -> Int32 in
          crypto_generichash(
            oPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
            SUBSEED_BYTES,
            sPtr.baseAddress?.assumingMemoryBound(to: UInt8.self),
            UInt64(seed.count),
            kPtr.baseAddress,
            context.count
          )
        }
      }
    }
    if rc != 0 { throw SignalEngineError.hashFailed }
    return out
  }

  private func deriveStoreMasterKey(seed: Data) throws -> Data {
    return try blake2bSubSeed(seed: seed, context: SIGNAL_STORE_KEY_CONTEXT)
  }

  private func deriveSignalIdentityKeyPair(seed: Data) throws -> IdentityKeyPair {
    let subSeed = try blake2bSubSeed(seed: seed, context: SIGNAL_IDENTITY_CONTEXT)
    // libsignal's signal_privatekey_deserialize accepts 32 raw bytes and
    // handles any internal scalar clamping at usage time. No manual clamping.
    let priv = try PrivateKey(subSeed)
    return IdentityKeyPair(publicKey: priv.publicKey, privateKey: priv)
  }

  // MARK: - Dict parsers (JS → libsignal types)

  private func parseAddress(_ map: [String: Any]) throws -> ProtocolAddress {
    guard let name = map["name"] as? String else {
      throw SignalEngineError.malformedAddress
    }
    let dev: UInt32
    if let n = map["deviceId"] as? Int { dev = UInt32(n) }
    else if let n = map["deviceId"] as? Double { dev = UInt32(n) }
    else { throw SignalEngineError.malformedAddress }
    return try ProtocolAddress(name: name, deviceId: dev)
  }

  private func parseBundle(_ b: [String: Any]) throws -> PreKeyBundle {
    func bytes(_ key: String) throws -> Data {
      guard let d = b[key] as? Data else {
        throw SignalEngineError.malformedBundle("missing or non-bytes field \(key)")
      }
      return d
    }
    func u32(_ key: String) throws -> UInt32 {
      if let n = b[key] as? Int { return UInt32(n) }
      if let n = b[key] as? Double { return UInt32(n) }
      throw SignalEngineError.malformedBundle("missing or non-number field \(key)")
    }

    let regId = try u32("registrationId")
    let deviceId = try u32("deviceId")
    let identityKey = try IdentityKey(bytes: try bytes("identityKey"))
    let signedPreKeyId = try u32("signedPreKeyId")
    let signedPreKey = try PublicKey(try bytes("signedPreKeyPublic"))
    let signedPreKeySig = try bytes("signedPreKeySignature")
    let preKeyId = try u32("preKeyId")
    let preKey = try PublicKey(try bytes("preKeyPublic"))
    let kyberPreKeyId = try u32("kyberPreKeyId")
    let kyberPreKey = try KEMPublicKey(try bytes("kyberPreKeyPublic"))
    let kyberPreKeySig = try bytes("kyberPreKeySignature")

    return try PreKeyBundle(
      registrationId: regId,
      deviceId: deviceId,
      prekeyId: preKeyId,
      prekey: preKey,
      signedPrekeyId: signedPreKeyId,
      signedPrekey: signedPreKey,
      signedPrekeySignature: signedPreKeySig,
      identity: identityKey,
      kyberPrekeyId: kyberPreKeyId,
      kyberPrekey: kyberPreKey,
      kyberPrekeySignature: kyberPreKeySig
    )
  }

  private func parseCiphertext(_ c: [String: Any]) throws -> (String, Data) {
    guard let kind = c["kind"] as? String,
          let serialized = c["serialized"] as? Data
    else { throw SignalEngineError.malformedCiphertext }
    return (kind, serialized)
  }

  // MARK: - Paths

  private func storeDbPath() throws -> String {
    let urls = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)
    guard let dir = urls.first else {
      throw SignalEngineError.engineNotInitialized
    }
    return dir.appendingPathComponent("signal-store.sqlite").path
  }

  // Little-endian byte encoding for u32 meta values. Matches the decoder
  // pattern in SessionsIdentityKeyStore and openStoreIfNeeded.
  private func leBytes(_ v: UInt32) -> Data {
    var le = v.littleEndian
    return withUnsafeBytes(of: &le) { Data($0) }
  }
}
