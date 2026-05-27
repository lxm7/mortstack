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

  private func loadEngine(snapshot: Data) throws -> ChatMlsEngine {
    do {
      // ChatMlsCore exposes a "read-only ephemeral engine" entry point via
      // UniFFI specifically for the NSE — see packages/chat-mls-core/src/
      // engine.rs#nse_engine_for_decrypt. The engine never persists; the
      // caller discards it after one process_message call.
      return try ChatMlsCore.engineForNse(snapshot: snapshot)
    } catch {
      throw MlsNseError.engineLoadFailed
    }
  }

  private func parsePlaintext(_ data: Data) throws -> Plaintext {
    // chat-transport plaintext frame, v=1:
    //   { "t": "msg-plaintext-v1", "sender": "Alex", "body": "hi" }
    // Mirrors the shape the main app stores in chat-db after decrypt.
    struct Frame: Decodable {
      let sender: String?
      let body: String?
    }
    guard let frame = try? JSONDecoder().decode(Frame.self, from: data) else {
      throw MlsNseError.unknownPlaintextShape
    }
    return Plaintext(
      title: frame.sender ?? "New message",
      body: frame.body ?? "Open the app to view"
    )
  }
}
