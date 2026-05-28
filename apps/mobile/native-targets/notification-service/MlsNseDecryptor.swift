// MlsNseDecryptor — loads the sealed MLS snapshot, decrypts the MLS
// application message, and returns plaintext for the NSE.
//
// Resources read from outside the NSE process:
//   1. App Group container — `mls-snapshot-v1.bin` (written by JS via
//      lib/chat/nse-snapshot.ts). Format: [version(1)][nonce(24)][ct(N)].
//   2. Keychain group `io.sessions.chat` — the M3 identity seed (32 B),
//      service `chat-identity-seed-v1`. Same seed `chat-crypto` writes
//      via `saveSeed` (ADR-011 + ChatCryptoModule).
//
// On any error, throw — the caller maps to a generic "New message" alert.

import Foundation
import Sodium
import ChatMlsCore  // UniFFI bindings vended by packages/chat-mls-core

enum MlsNseError: Error {
  case snapshotMissing
  case seedMissing
  case unsealFailed
  case engineLoadFailed
  case decryptFailed
  case unknownPlaintextShape
}

final class MlsNseDecryptor {
  static let shared = MlsNseDecryptor()
  private init() {}

  private let appGroup = "group.io.sessions.shared"
  private let snapshotFilename = "mls-snapshot-v1.bin"
  private let keychainGroup = "io.sessions.chat"
  private let seedService = "chat-identity-seed-v1"

  struct Plaintext {
    let title: String
    let body: String
  }

  func decrypt(ciphertextB64: String, nonceB64: String) throws -> Plaintext {
    let sealed = try loadSealedSnapshot()
    let seed = try loadIdentitySeed()
    let snapshotBytes = try unseal(sealed: sealed, seed: seed)

    let engine = try loadEngine(snapshot: snapshotBytes)

    guard
      let ciphertext = Data(base64Encoded: ciphertextB64),
      let nonce = Data(base64Encoded: nonceB64)
    else {
      throw MlsNseError.decryptFailed
    }

    // The cross-DO ciphertext is the full v=2 envelope produced by
    // chat-mls-core's encryptApp. It carries the groupId internally; the
    // engine routes to the correct group.
    let plaintext: Data
    do {
      plaintext = try engine.processNseApplication(
        ciphertext: ciphertext,
        nonce: nonce
      )
    } catch {
      throw MlsNseError.decryptFailed
    }

    return try parsePlaintext(plaintext)
  }

  // MARK: - Loaders

  private func loadSealedSnapshot() throws -> Data {
    guard
      let url = FileManager.default.containerURL(
        forSecurityApplicationGroupIdentifier: appGroup
      )?.appendingPathComponent(snapshotFilename)
    else { throw MlsNseError.snapshotMissing }

    do {
      return try Data(contentsOf: url)
    } catch {
      throw MlsNseError.snapshotMissing
    }
  }

  private func loadIdentitySeed() throws -> Data {
    var query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: seedService,
      kSecAttrAccessGroup as String: keychainGroup,
      kSecReturnData as String: kCFBooleanTrue!,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)
    guard status == errSecSuccess, let data = item as? Data, data.count == 32
    else {
      throw MlsNseError.seedMissing
    }
    return data
  }

  private func unseal(sealed: Data, seed: Data) throws -> Data {
    // sealed = [version(1)][nonce(24)][ciphertext(N)]
    guard sealed.count > 25, sealed[0] == 0x01 else {
      throw MlsNseError.unsealFailed
    }
    let nonce = sealed.subdata(in: 1..<25)
    let ciphertext = sealed.subdata(in: 25..<sealed.count)

    let sodium = Sodium()
    // Derive own X25519 keypair from the M3 seed. Matches ChatCrypto's
    // box semantics: we boxed to self (peerPub == ownPub).
    guard
      let kp = sodium.box.keyPair(seed: Bytes(seed))
    else { throw MlsNseError.unsealFailed }

    let plain: Bytes? = sodium.box.open(
      authenticatedCipherText: Bytes(ciphertext),
      senderPublicKey: kp.publicKey,
      recipientSecretKey: kp.secretKey,
      nonce: Bytes(nonce)
    )
    guard let p = plain else { throw MlsNseError.unsealFailed }
    return Data(p)
  }

  private func loadEngine(snapshot: Data) throws -> NseEngine {
    do {
      // chat-mls-core exposes a read-only ephemeral engine entry point via
      // UniFFI specifically for the NSE — see packages/chat-mls-core/src/
      // engine.rs#engine_for_nse. The engine rejects commits/welcomes/
      // proposals at the type boundary and is discarded after one call.
      return try engineForNse(snapshot: snapshot)
    } catch {
      throw MlsNseError.engineLoadFailed
    }
  }

  private func parsePlaintext(_ data: Data) throws -> Plaintext {
    // chat-transport plaintext frame (msgpack, schema mirrors
    // packages/chat/src/crypto-pipe.ts):
    //   { v: int, text: string, ts: uint, sender?: string }
    // We only care about `text` (body) and `sender` (title). Other fields
    // are skipped without interpretation so future schema additions don't
    // break the NSE — additive evolution is the contract.
    var r = MsgpackReader(data: data)
    guard let entryCount = r.readMapHeader() else {
      throw MlsNseError.unknownPlaintextShape
    }
    var sender: String?
    var text: String?
    for _ in 0..<entryCount {
      guard let key = r.readString() else {
        throw MlsNseError.unknownPlaintextShape
      }
      switch key {
      case "text":
        guard let v = r.readString() else { throw MlsNseError.unknownPlaintextShape }
        text = v
      case "sender":
        guard let v = r.readString() else { throw MlsNseError.unknownPlaintextShape }
        sender = v
      default:
        guard r.skipValue() else { throw MlsNseError.unknownPlaintextShape }
      }
    }
    guard let body = text else { throw MlsNseError.unknownPlaintextShape }
    return Plaintext(
      title: sender ?? "New message",
      body: body
    )
  }
}

// Minimal msgpack reader scoped to the chat-transport plaintext frame
// (flat map of string keys to string/integer/bool values). NOT a general
// msgpack parser — adding nested containers requires extending skipValue.
// Kept inline so the NSE has no transitive Pod dependency.
private struct MsgpackReader {
  let data: Data
  var offset: Int = 0

  init(data: Data) { self.data = data }

  private mutating func readByte() -> UInt8? {
    guard offset < data.count else { return nil }
    let b = data[data.startIndex + offset]
    offset += 1
    return b
  }

  private mutating func readBytes(_ n: Int) -> Data? {
    guard offset + n <= data.count else { return nil }
    let start = data.startIndex + offset
    let slice = data.subdata(in: start..<(start + n))
    offset += n
    return slice
  }

  mutating func readMapHeader() -> Int? {
    guard let b = readByte() else { return nil }
    // fixmap: 0x80..0x8f → low nibble = count
    if b & 0xf0 == 0x80 { return Int(b & 0x0f) }
    // map16: 0xde + uint16 BE
    if b == 0xde {
      guard let hi = readByte(), let lo = readByte() else { return nil }
      return (Int(hi) << 8) | Int(lo)
    }
    // map32: 0xdf + uint32 BE — pathological for our frame, supported defensively
    if b == 0xdf {
      guard let bytes = readBytes(4) else { return nil }
      return Int(UInt32(bytes[0]) << 24 | UInt32(bytes[1]) << 16 | UInt32(bytes[2]) << 8 | UInt32(bytes[3]))
    }
    return nil
  }

  mutating func readString() -> String? {
    guard let b = readByte() else { return nil }
    let len: Int
    if b & 0xe0 == 0xa0 {
      len = Int(b & 0x1f)
    } else if b == 0xd9 {
      guard let n = readByte() else { return nil }
      len = Int(n)
    } else if b == 0xda {
      guard let hi = readByte(), let lo = readByte() else { return nil }
      len = (Int(hi) << 8) | Int(lo)
    } else if b == 0xdb {
      guard let bytes = readBytes(4) else { return nil }
      len = Int(UInt32(bytes[0]) << 24 | UInt32(bytes[1]) << 16 | UInt32(bytes[2]) << 8 | UInt32(bytes[3]))
    } else {
      return nil
    }
    guard let raw = readBytes(len) else { return nil }
    return String(data: raw, encoding: .utf8)
  }

  // Skip one value of any flat type. Returns false on unsupported tag
  // (e.g. arrays/nested maps) — caller treats as parse failure rather than
  // silently misaligning the read cursor.
  mutating func skipValue() -> Bool {
    guard let b = readByte() else { return false }
    // positive fixint (0x00..0x7f) and negative fixint (0xe0..0xff)
    if b & 0x80 == 0x00 { return true }
    if b & 0xe0 == 0xe0 { return true }
    // fixstr
    if b & 0xe0 == 0xa0 {
      return readBytes(Int(b & 0x1f)) != nil
    }
    switch b {
    case 0xc0, 0xc2, 0xc3: return true              // nil, false, true
    case 0xcc, 0xd0: return readBytes(1) != nil      // uint8 / int8
    case 0xcd, 0xd1: return readBytes(2) != nil      // uint16 / int16
    case 0xce, 0xd2, 0xca: return readBytes(4) != nil // uint32 / int32 / float32
    case 0xcf, 0xd3, 0xcb: return readBytes(8) != nil // uint64 / int64 / float64
    case 0xd9: // str8
      guard let n = readByte() else { return false }
      return readBytes(Int(n)) != nil
    case 0xda: // str16
      guard let hi = readByte(), let lo = readByte() else { return false }
      return readBytes((Int(hi) << 8) | Int(lo)) != nil
    case 0xdb: // str32
      guard let bytes = readBytes(4) else { return false }
      return readBytes(Int(UInt32(bytes[0]) << 24 | UInt32(bytes[1]) << 16 | UInt32(bytes[2]) << 8 | UInt32(bytes[3]))) != nil
    case 0xc4: // bin8
      guard let n = readByte() else { return false }
      return readBytes(Int(n)) != nil
    case 0xc5: // bin16
      guard let hi = readByte(), let lo = readByte() else { return false }
      return readBytes((Int(hi) << 8) | Int(lo)) != nil
    case 0xc6: // bin32
      guard let bytes = readBytes(4) else { return false }
      return readBytes(Int(UInt32(bytes[0]) << 24 | UInt32(bytes[1]) << 16 | UInt32(bytes[2]) << 8 | UInt32(bytes[3]))) != nil
    default:
      return false
    }
  }
}
