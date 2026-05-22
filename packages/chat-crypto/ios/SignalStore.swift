import Foundation
import SQLite3
import Clibsodium

// Storage layer for the 5 libsignal protocol stores (Session, Identity,
// PreKey, SignedPreKey, KyberPreKey) plus engine-local metadata (registration
// id, local address, identity keypair serialized).
//
// On-disk format: plain SQLite at Library/Application Support/signal-store.sqlite,
// every BLOB column wrapped in libsodium crypto_secretbox_easy with a
// per-record random 24-byte nonce. Master key is derived once by the engine
// (BLAKE2b(seed, key="sessions/signal-store/v1")) and held in memory; the
// disk file alone is useless without the keychain-protected seed.
//
// Storage path lives in the app sandbox for M3.5 chunk 1C. M6 push milestone
// migrates this file to an App Group container so the Notification Service
// Extension can read protocol state for decrypting pushes. Schema is
// otherwise unchanged; migration = file copy at first NSE launch.
//
// SQLite is opened in serialized mode (SQLITE_OPEN_FULLMUTEX) — libsignal may
// invoke store methods from background threads, and Swift wrappers don't
// serialize access internally.

// ── Sizes (mirrors of libsodium constants — easier than fishing C macros
// through the Clibsodium module map) ─────────────────────────────────────
private let SECRETBOX_KEY_BYTES = 32   // crypto_secretbox_KEYBYTES
private let SECRETBOX_NONCE_BYTES = 24 // crypto_secretbox_NONCEBYTES
private let SECRETBOX_MAC_BYTES = 16   // crypto_secretbox_MACBYTES

enum SignalStoreError: Error, LocalizedError, CustomStringConvertible {
  case openFailed(Int32, String)
  case prepareFailed(Int32, String)
  case stepFailed(Int32, String)
  case migrationFailed(String)
  case encryptionFailed
  case decryptionFailed
  case invalidMasterKey(Int)
  case corrupt(String)

  var description: String {
    switch self {
    case .openFailed(let rc, let msg):     return "signal-store: open failed rc=\(rc) (\(msg))"
    case .prepareFailed(let rc, let msg):  return "signal-store: prepare failed rc=\(rc) (\(msg))"
    case .stepFailed(let rc, let msg):     return "signal-store: step failed rc=\(rc) (\(msg))"
    case .migrationFailed(let msg):        return "signal-store: migration failed (\(msg))"
    case .encryptionFailed:                return "signal-store: secretbox encrypt failed"
    case .decryptionFailed:                return "signal-store: secretbox decrypt failed — bad key or tampered row"
    case .invalidMasterKey(let n):         return "signal-store: master key must be 32 bytes, got \(n)"
    case .corrupt(let msg):                return "signal-store: corruption detected (\(msg))"
    }
  }
  var errorDescription: String? { description }
}

final class SignalStore {

  // SQLite finalize-on-bind sentinel. Pass to sqlite3_bind_* so the binding
  // copies the value rather than aliasing transient memory.
  private static let SQLITE_TRANSIENT = unsafeBitCast(
    OpaquePointer(bitPattern: -1), to: sqlite3_destructor_type.self
  )

  private var db: OpaquePointer!
  private let masterKey: Data

  // MARK: - Lifecycle

  init(dbPath: String, masterKey: Data) throws {
    guard masterKey.count == SECRETBOX_KEY_BYTES else {
      throw SignalStoreError.invalidMasterKey(masterKey.count)
    }
    self.masterKey = masterKey

    // Ensure parent dir exists. Library/Application Support is created on
    // demand on iOS, not automatically.
    let parent = (dbPath as NSString).deletingLastPathComponent
    try? FileManager.default.createDirectory(
      atPath: parent, withIntermediateDirectories: true)

    let flags = SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE | SQLITE_OPEN_FULLMUTEX
    var handle: OpaquePointer?
    let rc = sqlite3_open_v2(dbPath, &handle, flags, nil)
    if rc != SQLITE_OK {
      let msg = handle.flatMap { String(cString: sqlite3_errmsg($0)) } ?? "unknown"
      sqlite3_close(handle)
      throw SignalStoreError.openFailed(rc, msg)
    }
    self.db = handle

    // WAL gives us concurrent readers + a single writer without locking the
    // file long enough to block libsignal's ratchet writes during high-throughput
    // exchanges. NORMAL synchronous is fine here — losing the last few writes
    // on a crash means losing the last few messages, not corrupting the DB.
    try exec("PRAGMA journal_mode = WAL;")
    try exec("PRAGMA synchronous = NORMAL;")
    try exec("PRAGMA foreign_keys = ON;")

    try migrate()
  }

  deinit {
    if db != nil { sqlite3_close(db) }
  }

  // MARK: - Migration

  private func migrate() throws {
    // Single forward-only migration for now. Bumping schema requires adding
    // additional ALTER/CREATE statements gated on the current user_version,
    // not editing this one — see chat-db pattern.
    let currentVersion = try userVersion()
    if currentVersion >= 1 { return }

    try exec("""
    CREATE TABLE IF NOT EXISTS meta (
      key   TEXT PRIMARY KEY NOT NULL,
      value BLOB NOT NULL
    ) WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS prekeys (
      id     INTEGER PRIMARY KEY NOT NULL,
      record BLOB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS signed_prekeys (
      id     INTEGER PRIMARY KEY NOT NULL,
      record BLOB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kyber_prekeys (
      id     INTEGER PRIMARY KEY NOT NULL,
      record BLOB NOT NULL,
      used   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      name      TEXT NOT NULL,
      device_id INTEGER NOT NULL,
      record    BLOB NOT NULL,
      PRIMARY KEY (name, device_id)
    ) WITHOUT ROWID;

    CREATE TABLE IF NOT EXISTS peer_identities (
      name         TEXT NOT NULL,
      device_id    INTEGER NOT NULL,
      identity_key BLOB NOT NULL,
      PRIMARY KEY (name, device_id)
    ) WITHOUT ROWID;

    PRAGMA user_version = 1;
    """)
  }

  private func userVersion() throws -> Int32 {
    var stmt: OpaquePointer?
    guard sqlite3_prepare_v2(db, "PRAGMA user_version;", -1, &stmt, nil) == SQLITE_OK else {
      throw SignalStoreError.prepareFailed(sqlite3_errcode(db), errmsg())
    }
    defer { sqlite3_finalize(stmt) }
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_ROW { return 0 }
    return sqlite3_column_int(stmt, 0)
  }

  // MARK: - Meta (singleton key-value rows)

  // Used for: local_name (UTF-8), local_device_id (u32 little-endian),
  // registration_id (u32 LE), identity_keypair (libsignal-serialized).
  func getMeta(_ key: String) throws -> Data? {
    var stmt: OpaquePointer?
    try prepare("SELECT value FROM meta WHERE key = ?1;", &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, key)
    let rc = sqlite3_step(stmt)
    if rc == SQLITE_DONE { return nil }
    if rc != SQLITE_ROW { throw SignalStoreError.stepFailed(rc, errmsg()) }
    let envelope = readBlob(stmt, 0)
    return try decrypt(envelope)
  }

  func setMeta(_ key: String, _ value: Data) throws {
    let envelope = try encrypt(value)
    var stmt: OpaquePointer?
    try prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?1, ?2);", &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, key)
    try bindBlob(stmt, 2, envelope)
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  // MARK: - PreKey (one-time)

  func loadPreKey(_ id: UInt32) throws -> Data? {
    return try loadIdKeyed(table: "prekeys", id: id)
  }
  func storePreKey(_ id: UInt32, _ record: Data) throws {
    try storeIdKeyed(table: "prekeys", id: id, record: record)
  }
  func removePreKey(_ id: UInt32) throws {
    var stmt: OpaquePointer?
    try prepare("DELETE FROM prekeys WHERE id = ?1;", &stmt)
    defer { sqlite3_finalize(stmt) }
    sqlite3_bind_int64(stmt, 1, Int64(id))
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }
  func countPreKeys() throws -> Int {
    var stmt: OpaquePointer?
    try prepare("SELECT COUNT(*) FROM prekeys;", &stmt)
    defer { sqlite3_finalize(stmt) }
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_ROW { throw SignalStoreError.stepFailed(rc, errmsg()) }
    return Int(sqlite3_column_int64(stmt, 0))
  }

  // MARK: - SignedPreKey

  func loadSignedPreKey(_ id: UInt32) throws -> Data? {
    return try loadIdKeyed(table: "signed_prekeys", id: id)
  }
  func storeSignedPreKey(_ id: UInt32, _ record: Data) throws {
    try storeIdKeyed(table: "signed_prekeys", id: id, record: record)
  }

  // MARK: - KyberPreKey

  func loadKyberPreKey(_ id: UInt32) throws -> Data? {
    return try loadIdKeyed(table: "kyber_prekeys", id: id)
  }
  func storeKyberPreKey(_ id: UInt32, _ record: Data) throws {
    try storeIdKeyed(table: "kyber_prekeys", id: id, record: record)
  }
  func markKyberPreKeyUsed(_ id: UInt32) throws {
    var stmt: OpaquePointer?
    try prepare("UPDATE kyber_prekeys SET used = 1 WHERE id = ?1;", &stmt)
    defer { sqlite3_finalize(stmt) }
    sqlite3_bind_int64(stmt, 1, Int64(id))
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  // MARK: - Session

  func loadSession(name: String, deviceId: UInt32) throws -> Data? {
    return try loadAddressKeyed(table: "sessions", column: "record",
                                name: name, deviceId: deviceId)
  }
  func storeSession(name: String, deviceId: UInt32, record: Data) throws {
    try storeAddressKeyed(table: "sessions", column: "record",
                          name: name, deviceId: deviceId, value: record)
  }
  func hasSession(name: String, deviceId: UInt32) throws -> Bool {
    var stmt: OpaquePointer?
    try prepare("SELECT 1 FROM sessions WHERE name = ?1 AND device_id = ?2 LIMIT 1;", &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, name)
    sqlite3_bind_int64(stmt, 2, Int64(deviceId))
    return sqlite3_step(stmt) == SQLITE_ROW
  }
  func deleteSession(name: String, deviceId: UInt32) throws {
    var stmt: OpaquePointer?
    try prepare("DELETE FROM sessions WHERE name = ?1 AND device_id = ?2;", &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, name)
    sqlite3_bind_int64(stmt, 2, Int64(deviceId))
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }
  func loadSessions(addresses: [(name: String, deviceId: UInt32)]) throws -> [Data] {
    var out: [Data] = []
    out.reserveCapacity(addresses.count)
    for addr in addresses {
      if let r = try loadSession(name: addr.name, deviceId: addr.deviceId) {
        out.append(r)
      }
    }
    return out
  }

  // MARK: - Peer identity (trust map)

  func loadPeerIdentity(name: String, deviceId: UInt32) throws -> Data? {
    return try loadAddressKeyed(table: "peer_identities", column: "identity_key",
                                name: name, deviceId: deviceId)
  }
  func storePeerIdentity(name: String, deviceId: UInt32, identityKey: Data) throws {
    try storeAddressKeyed(table: "peer_identities", column: "identity_key",
                          name: name, deviceId: deviceId, value: identityKey)
  }

  // MARK: - Internal: id-keyed table helpers

  private func loadIdKeyed(table: String, id: UInt32) throws -> Data? {
    var stmt: OpaquePointer?
    try prepare("SELECT record FROM \(table) WHERE id = ?1;", &stmt)
    defer { sqlite3_finalize(stmt) }
    sqlite3_bind_int64(stmt, 1, Int64(id))
    let rc = sqlite3_step(stmt)
    if rc == SQLITE_DONE { return nil }
    if rc != SQLITE_ROW { throw SignalStoreError.stepFailed(rc, errmsg()) }
    return try decrypt(readBlob(stmt, 0))
  }
  private func storeIdKeyed(table: String, id: UInt32, record: Data) throws {
    let envelope = try encrypt(record)
    var stmt: OpaquePointer?
    try prepare("INSERT OR REPLACE INTO \(table) (id, record) VALUES (?1, ?2);", &stmt)
    defer { sqlite3_finalize(stmt) }
    sqlite3_bind_int64(stmt, 1, Int64(id))
    try bindBlob(stmt, 2, envelope)
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  // MARK: - Internal: (name, deviceId)-keyed table helpers

  private func loadAddressKeyed(
    table: String, column: String, name: String, deviceId: UInt32
  ) throws -> Data? {
    var stmt: OpaquePointer?
    try prepare("SELECT \(column) FROM \(table) WHERE name = ?1 AND device_id = ?2;", &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, name)
    sqlite3_bind_int64(stmt, 2, Int64(deviceId))
    let rc = sqlite3_step(stmt)
    if rc == SQLITE_DONE { return nil }
    if rc != SQLITE_ROW { throw SignalStoreError.stepFailed(rc, errmsg()) }
    return try decrypt(readBlob(stmt, 0))
  }
  private func storeAddressKeyed(
    table: String, column: String, name: String, deviceId: UInt32, value: Data
  ) throws {
    let envelope = try encrypt(value)
    var stmt: OpaquePointer?
    try prepare("""
      INSERT OR REPLACE INTO \(table) (name, device_id, \(column))
      VALUES (?1, ?2, ?3);
      """, &stmt)
    defer { sqlite3_finalize(stmt) }
    try bindText(stmt, 1, name)
    sqlite3_bind_int64(stmt, 2, Int64(deviceId))
    try bindBlob(stmt, 3, envelope)
    let rc = sqlite3_step(stmt)
    if rc != SQLITE_DONE { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  // MARK: - AEAD wrapping (libsodium secretbox)

  // Envelope layout: nonce (24 bytes) || ciphertext (variable length).
  // crypto_secretbox_easy outputs MAC || plaintext-cipher, so ciphertext is
  // already MAC-prefixed and self-authenticating.
  private func encrypt(_ plaintext: Data) throws -> Data {
    var nonce = Data(count: SECRETBOX_NONCE_BYTES)
    nonce.withUnsafeMutableBytes { ptr in
      randombytes_buf(ptr.baseAddress!, SECRETBOX_NONCE_BYTES)
    }
    var ct = Data(count: plaintext.count + SECRETBOX_MAC_BYTES)
    let rc = ct.withUnsafeMutableBytes { (ctPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      plaintext.withUnsafeBytes { (ptPtr: UnsafeRawBufferPointer) -> Int32 in
        nonce.withUnsafeBytes { (nPtr: UnsafeRawBufferPointer) -> Int32 in
          masterKey.withUnsafeBytes { (kPtr: UnsafeRawBufferPointer) -> Int32 in
            crypto_secretbox_easy(
              ctPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              ptPtr.baseAddress?.assumingMemoryBound(to: UInt8.self),
              UInt64(plaintext.count),
              nPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              kPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
            )
          }
        }
      }
    }
    if rc != 0 { throw SignalStoreError.encryptionFailed }
    var envelope = Data(capacity: nonce.count + ct.count)
    envelope.append(nonce)
    envelope.append(ct)
    return envelope
  }

  private func decrypt(_ envelope: Data) throws -> Data {
    guard envelope.count >= SECRETBOX_NONCE_BYTES + SECRETBOX_MAC_BYTES else {
      throw SignalStoreError.corrupt("envelope too short (\(envelope.count) bytes)")
    }
    let nonce = envelope.prefix(SECRETBOX_NONCE_BYTES)
    let ct = envelope.suffix(from: SECRETBOX_NONCE_BYTES)
    let ptLen = ct.count - SECRETBOX_MAC_BYTES
    var pt = Data(count: ptLen)
    let rc = pt.withUnsafeMutableBytes { (ptPtr: UnsafeMutableRawBufferPointer) -> Int32 in
      ct.withUnsafeBytes { (ctPtr: UnsafeRawBufferPointer) -> Int32 in
        nonce.withUnsafeBytes { (nPtr: UnsafeRawBufferPointer) -> Int32 in
          masterKey.withUnsafeBytes { (kPtr: UnsafeRawBufferPointer) -> Int32 in
            crypto_secretbox_open_easy(
              ptPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              ctPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              UInt64(ct.count),
              nPtr.baseAddress!.assumingMemoryBound(to: UInt8.self),
              kPtr.baseAddress!.assumingMemoryBound(to: UInt8.self)
            )
          }
        }
      }
    }
    if rc != 0 { throw SignalStoreError.decryptionFailed }
    return pt
  }

  // MARK: - SQLite plumbing

  private func exec(_ sql: String) throws {
    var err: UnsafeMutablePointer<CChar>?
    let rc = sqlite3_exec(db, sql, nil, nil, &err)
    if rc != SQLITE_OK {
      let msg = err.map { String(cString: $0) } ?? "unknown"
      sqlite3_free(err)
      throw SignalStoreError.migrationFailed(msg)
    }
  }

  private func prepare(_ sql: String, _ stmt: inout OpaquePointer?) throws {
    let rc = sqlite3_prepare_v2(db, sql, -1, &stmt, nil)
    if rc != SQLITE_OK {
      throw SignalStoreError.prepareFailed(rc, errmsg())
    }
  }

  private func bindText(_ stmt: OpaquePointer?, _ idx: Int32, _ value: String) throws {
    let rc = sqlite3_bind_text(stmt, idx, value, -1, Self.SQLITE_TRANSIENT)
    if rc != SQLITE_OK { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  private func bindBlob(_ stmt: OpaquePointer?, _ idx: Int32, _ value: Data) throws {
    let rc = value.withUnsafeBytes { (buf: UnsafeRawBufferPointer) -> Int32 in
      sqlite3_bind_blob(stmt, idx, buf.baseAddress, Int32(buf.count), Self.SQLITE_TRANSIENT)
    }
    if rc != SQLITE_OK { throw SignalStoreError.stepFailed(rc, errmsg()) }
  }

  private func readBlob(_ stmt: OpaquePointer?, _ idx: Int32) -> Data {
    guard let ptr = sqlite3_column_blob(stmt, idx) else { return Data() }
    let n = Int(sqlite3_column_bytes(stmt, idx))
    return Data(bytes: ptr, count: n)
  }

  private func errmsg() -> String {
    return String(cString: sqlite3_errmsg(db))
  }
}
