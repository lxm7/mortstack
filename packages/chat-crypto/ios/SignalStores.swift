import Foundation

// libsignal protocol-store conformances backed by SignalStore (SQLite +
// libsodium-secretbox AEAD on every blob column).
//
// libsignal's Double Ratchet mutates the SessionRecord on every send/receive,
// then calls storeSession(...) back into us with the new state. If a
// storeSession call fails or is dropped between in-memory mutation and disk,
// the session can desync from the peer and force a fresh PreKey handshake on
// the next inbound message. We surface persistence errors to libsignal so
// users see a clear failure rather than corrupted-session decrypt rejects.

// Marker for libsignal's StoreContext-typed parameter on every store method.
// Nothing reads it on our side, but libsignal wants a value, so we pass this
// shared singleton on every call.
final class SessionsSignalStoreContext: StoreContext {
  static let shared = SessionsSignalStoreContext()
  private init() {}
}

enum SessionsStoreError: Error, LocalizedError, CustomStringConvertible {
  case missingPreKey(UInt32)
  case missingSignedPreKey(UInt32)
  case missingKyberPreKey(UInt32)
  case invalidStoredIdentity
  case identityNotInitialized

  var description: String {
    switch self {
    case .missingPreKey(let id):       return "store: pre-key \(id) not found"
    case .missingSignedPreKey(let id): return "store: signed-pre-key \(id) not found"
    case .missingKyberPreKey(let id):  return "store: kyber-pre-key \(id) not found"
    case .invalidStoredIdentity:       return "store: stored identity keypair is corrupt"
    case .identityNotInitialized:
      return "store: local identity not initialized — call signalCreateBundle first"
    }
  }
  var errorDescription: String? { description }
}

// MARK: - Session store

final class SessionsSessionStore: SessionStore {
  private let store: SignalStore
  init(store: SignalStore) { self.store = store }

  func loadSession(for address: ProtocolAddress, context: StoreContext) throws -> SessionRecord? {
    guard let blob = try store.loadSession(name: address.name, deviceId: address.deviceId)
    else { return nil }
    return try SessionRecord(bytes: blob)
  }

  func loadExistingSessions(
    for addresses: [ProtocolAddress], context: StoreContext
  ) throws -> [SessionRecord] {
    let pairs = addresses.map { (name: $0.name, deviceId: $0.deviceId) }
    let blobs = try store.loadSessions(addresses: pairs)
    return try blobs.map { try SessionRecord(bytes: $0) }
  }

  func storeSession(
    _ record: SessionRecord, for address: ProtocolAddress, context: StoreContext
  ) throws {
    try store.storeSession(
      name: address.name, deviceId: address.deviceId, record: record.serialize()
    )
  }
}

// MARK: - Identity store

// Local identity (keypair + registration id) is cached in memory after engine
// init/bundle-creation, set via `setLocalIdentity(...)`. libsignal calls
// identityKeyPair() + localRegistrationId() on hot paths (every encrypt) —
// disk hits on every send would be wasteful, and the values never change
// without an explicit signalCreateBundle re-init.
final class SessionsIdentityKeyStore: IdentityKeyStore {
  private let store: SignalStore
  private var cachedIdentity: IdentityKeyPair?
  private var cachedRegistrationId: UInt32?

  init(store: SignalStore) { self.store = store }

  func setLocalIdentity(_ identity: IdentityKeyPair, registrationId: UInt32) {
    self.cachedIdentity = identity
    self.cachedRegistrationId = registrationId
  }

  func identityKeyPair(context: StoreContext) throws -> IdentityKeyPair {
    if let cached = cachedIdentity { return cached }
    guard let blob = try store.getMeta(MetaKey.identityKeyPair) else {
      throw SessionsStoreError.identityNotInitialized
    }
    let pair: IdentityKeyPair
    do {
      pair = try IdentityKeyPair(bytes: blob)
    } catch {
      throw SessionsStoreError.invalidStoredIdentity
    }
    self.cachedIdentity = pair
    return pair
  }

  func localRegistrationId(context: StoreContext) throws -> UInt32 {
    if let cached = cachedRegistrationId { return cached }
    guard let blob = try store.getMeta(MetaKey.registrationId), blob.count == 4 else {
      throw SessionsStoreError.identityNotInitialized
    }
    let id = blob.withUnsafeBytes { $0.load(as: UInt32.self) }.littleEndian
    self.cachedRegistrationId = id
    return id
  }

  func saveIdentity(
    _ identity: IdentityKey, for address: ProtocolAddress, context: StoreContext
  ) throws -> IdentityChange {
    let serialized = identity.publicKey.serialize()
    let prior = try store.loadPeerIdentity(name: address.name, deviceId: address.deviceId)
    try store.storePeerIdentity(
      name: address.name, deviceId: address.deviceId, identityKey: serialized
    )
    if let prior = prior, prior != serialized { return .replacedExisting }
    return .newOrUnchanged
  }

  // TOFU policy at MVP — accept any identity not previously seen and reject
  // only on mismatch with an already-stored identity for the same address.
  // M4 chat UI will surface a "safety number changed" affordance.
  func isTrustedIdentity(
    _ identity: IdentityKey, for address: ProtocolAddress,
    direction: Direction, context: StoreContext
  ) throws -> Bool {
    let known = try store.loadPeerIdentity(name: address.name, deviceId: address.deviceId)
    if let known = known {
      return known == identity.publicKey.serialize()
    }
    return true
  }

  func identity(
    for address: ProtocolAddress, context: StoreContext
  ) throws -> IdentityKey? {
    guard let blob = try store.loadPeerIdentity(name: address.name, deviceId: address.deviceId)
    else { return nil }
    let pub = try PublicKey(blob)
    return IdentityKey(publicKey: pub)
  }
}

// MARK: - PreKey store (one-time)

final class SessionsPreKeyStore: PreKeyStore {
  private let store: SignalStore
  init(store: SignalStore) { self.store = store }

  func loadPreKey(id: UInt32, context: StoreContext) throws -> PreKeyRecord {
    guard let blob = try store.loadPreKey(id) else {
      throw SessionsStoreError.missingPreKey(id)
    }
    return try PreKeyRecord(bytes: blob)
  }

  func storePreKey(_ record: PreKeyRecord, id: UInt32, context: StoreContext) throws {
    try store.storePreKey(id, record.serialize())
  }

  func removePreKey(id: UInt32, context: StoreContext) throws {
    try store.removePreKey(id)
  }
}

// MARK: - SignedPreKey store

final class SessionsSignedPreKeyStore: SignedPreKeyStore {
  private let store: SignalStore
  init(store: SignalStore) { self.store = store }

  func loadSignedPreKey(id: UInt32, context: StoreContext) throws -> SignedPreKeyRecord {
    guard let blob = try store.loadSignedPreKey(id) else {
      throw SessionsStoreError.missingSignedPreKey(id)
    }
    return try SignedPreKeyRecord(bytes: blob)
  }

  func storeSignedPreKey(
    _ record: SignedPreKeyRecord, id: UInt32, context: StoreContext
  ) throws {
    try store.storeSignedPreKey(id, record.serialize())
  }
}

// MARK: - KyberPreKey store

final class SessionsKyberPreKeyStore: KyberPreKeyStore {
  private let store: SignalStore
  init(store: SignalStore) { self.store = store }

  func loadKyberPreKey(id: UInt32, context: StoreContext) throws -> KyberPreKeyRecord {
    guard let blob = try store.loadKyberPreKey(id) else {
      throw SessionsStoreError.missingKyberPreKey(id)
    }
    return try KyberPreKeyRecord(bytes: blob)
  }

  func storeKyberPreKey(
    _ record: KyberPreKeyRecord, id: UInt32, context: StoreContext
  ) throws {
    try store.storeKyberPreKey(id, record.serialize())
  }

  // signedPreKeyId + baseKey are spec-mandated bookkeeping context but we
  // don't need them at MVP — usage tracking is a single bit per kyber prekey,
  // sufficient to know whether the row has been consumed.
  func markKyberPreKeyUsed(
    id: UInt32, signedPreKeyId: UInt32, baseKey: PublicKey, context: StoreContext
  ) throws {
    try store.markKyberPreKeyUsed(id)
  }
}

// MARK: - Metadata key constants

// Keys for SignalStore.meta. Centralized so engine + identity store reference
// the same strings.
enum MetaKey {
  static let identityKeyPair = "identity_keypair"      // libsignal-serialized IdentityKeyPair
  static let registrationId  = "registration_id"        // u32 LE
  static let localName       = "local_name"             // UTF-8, our Account.id
  static let localDeviceId   = "local_device_id"        // u32 LE
}
