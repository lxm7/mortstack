// MlsAndroidDecryptor — reads the sealed MLS snapshot from app-private
// storage, the M3 identity seed from EncryptedSharedPreferences, unseals
// via libsodium, runs ephemeral OpenMLS to decrypt one application message.
//
// On Android, FCM lives in-process with the main app (no extension
// sandbox), so the snapshot doesn't need an inter-process shared
// container — it lives in `filesDir/mls-snapshot-v1.bin`. The seed is
// already in EncryptedSharedPreferences (ChatCrypto's Android backing
// store per ADR-011).

package io.sessions.app.push

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import uniffi.chat_mls_core.engineForNse
import java.io.File
import com.goterl.lazysodium.LazySodiumAndroid
import com.goterl.lazysodium.SodiumAndroid
import com.goterl.lazysodium.utils.Key
import com.goterl.lazysodium.utils.KeyPair

data class Plaintext(val title: String, val body: String)

object MlsAndroidDecryptor {

  private const val SNAPSHOT_FILENAME = "mls-snapshot-v1.bin"
  private const val SEED_PREFS = "io.sessions.chat.identity"
  private const val SEED_KEY = "chat-identity-seed-v1"

  private val sodium = LazySodiumAndroid(SodiumAndroid())

  fun decrypt(
    context: Context,
    ciphertextB64: String,
    nonceB64: String
  ): Plaintext {
    val sealed = loadSealedSnapshot(context) ?: throw IllegalStateException("snapshot missing")
    val seed = loadIdentitySeed(context) ?: throw IllegalStateException("seed missing")
    val snapshot = unseal(sealed, seed)

    val ciphertext = android.util.Base64.decode(ciphertextB64, android.util.Base64.NO_WRAP)
    val nonce = android.util.Base64.decode(nonceB64, android.util.Base64.NO_WRAP)

    val plaintextBytes = engineForNse(snapshot)
      .processNseApplication(ciphertext, nonce)

    return parsePlaintext(plaintextBytes)
  }

  // ── Loaders ─────────────────────────────────────────────────────────────

  private fun loadSealedSnapshot(context: Context): ByteArray? {
    val f = File(context.filesDir, SNAPSHOT_FILENAME)
    if (!f.exists()) return null
    return f.readBytes()
  }

  private fun loadIdentitySeed(context: Context): ByteArray? {
    val masterKey = MasterKey.Builder(context)
      .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
      .build()
    val prefs = EncryptedSharedPreferences.create(
      context,
      SEED_PREFS,
      masterKey,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    val b64 = prefs.getString(SEED_KEY, null) ?: return null
    val raw = android.util.Base64.decode(b64, android.util.Base64.NO_WRAP)
    return if (raw.size == 32) raw else null
  }

  private fun unseal(sealed: ByteArray, seed: ByteArray): ByteArray {
    // [version(1)][nonce(24)][ciphertext(N)] — version 0x01 only.
    require(sealed.size > 25 && sealed[0] == 0x01.toByte()) { "bad snapshot envelope" }
    val nonce = sealed.copyOfRange(1, 25)
    val ciphertext = sealed.copyOfRange(25, sealed.size)

    // Derive own X25519 keypair from the M3 seed (same as iOS / ChatCrypto).
    val kp: KeyPair = sodium.cryptoBoxSeedKeypair(Key.fromBytes(seed))

    val plain = ByteArray(ciphertext.size - 16) // crypto_box_MACBYTES = 16
    val ok = sodium.cryptoBoxOpenEasy(
      plain,
      ciphertext,
      ciphertext.size.toLong(),
      nonce,
      kp.publicKey.asBytes,
      kp.secretKey.asBytes
    )
    if (!ok) throw IllegalStateException("snapshot unseal failed")
    return plain
  }

  private fun parsePlaintext(bytes: ByteArray): Plaintext {
    // chat-transport plaintext frame (msgpack; mirrors
    // packages/chat/src/crypto-pipe.ts):
    //   { v: int, text: string, ts: uint, sender?: string }
    // Only `text` (body) and `sender` (title) are surfaced; unknown keys
    // are skipped so additive schema changes don't break the decoder.
    val r = MsgpackReader(bytes)
    val entryCount = r.readMapHeader() ?: throw IllegalStateException("bad msgpack: not a map")
    var sender: String? = null
    var text: String? = null
    repeat(entryCount) {
      val key = r.readString() ?: throw IllegalStateException("bad msgpack: non-string key")
      when (key) {
        "text" -> text = r.readString() ?: throw IllegalStateException("text not a string")
        "sender" -> sender = r.readString() ?: throw IllegalStateException("sender not a string")
        else -> if (!r.skipValue()) throw IllegalStateException("unsupported value for key=$key")
      }
    }
    val body = text ?: throw IllegalStateException("frame missing required `text` field")
    return Plaintext(
      title = sender ?: "New message",
      body = body
    )
  }
}

// Minimal msgpack reader scoped to the chat-transport plaintext frame
// (flat map of string keys to string/integer/bool values). Kotlin twin of
// the Swift MsgpackReader in MlsNseDecryptor.swift — keep them in lockstep.
private class MsgpackReader(private val data: ByteArray) {
  private var offset: Int = 0

  private fun readByte(): Int? {
    if (offset >= data.size) return null
    val b = data[offset].toInt() and 0xff
    offset += 1
    return b
  }

  private fun readBytes(n: Int): ByteArray? {
    if (n < 0 || offset + n > data.size) return null
    val out = data.copyOfRange(offset, offset + n)
    offset += n
    return out
  }

  fun readMapHeader(): Int? {
    val b = readByte() ?: return null
    // fixmap 0x80..0x8f
    if ((b and 0xf0) == 0x80) return b and 0x0f
    // map16 0xde + uint16 BE
    if (b == 0xde) {
      val hi = readByte() ?: return null
      val lo = readByte() ?: return null
      return (hi shl 8) or lo
    }
    // map32 0xdf + uint32 BE (defensive — unrealistic for our frame)
    if (b == 0xdf) {
      val raw = readBytes(4) ?: return null
      return ((raw[0].toInt() and 0xff) shl 24) or
        ((raw[1].toInt() and 0xff) shl 16) or
        ((raw[2].toInt() and 0xff) shl 8) or
        (raw[3].toInt() and 0xff)
    }
    return null
  }

  fun readString(): String? {
    val b = readByte() ?: return null
    val len: Int = when {
      (b and 0xe0) == 0xa0 -> b and 0x1f                       // fixstr
      b == 0xd9 -> readByte() ?: return null                   // str8
      b == 0xda -> {
        val hi = readByte() ?: return null
        val lo = readByte() ?: return null
        (hi shl 8) or lo
      }
      b == 0xdb -> {
        val raw = readBytes(4) ?: return null
        ((raw[0].toInt() and 0xff) shl 24) or
          ((raw[1].toInt() and 0xff) shl 16) or
          ((raw[2].toInt() and 0xff) shl 8) or
          (raw[3].toInt() and 0xff)
      }
      else -> return null
    }
    val raw = readBytes(len) ?: return null
    return String(raw, Charsets.UTF_8)
  }

  // Skip one value of any flat type. False = unsupported tag (caller treats
  // as parse failure; cursor may be advanced — caller must abort the frame).
  fun skipValue(): Boolean {
    val b = readByte() ?: return false
    // positive fixint 0x00..0x7f, negative fixint 0xe0..0xff
    if ((b and 0x80) == 0x00) return true
    if ((b and 0xe0) == 0xe0) return true
    // fixstr
    if ((b and 0xe0) == 0xa0) return readBytes(b and 0x1f) != null
    return when (b) {
      0xc0, 0xc2, 0xc3 -> true                                   // nil, false, true
      0xcc, 0xd0 -> readBytes(1) != null                          // uint8 / int8
      0xcd, 0xd1 -> readBytes(2) != null                          // uint16 / int16
      0xce, 0xd2, 0xca -> readBytes(4) != null                    // uint32 / int32 / float32
      0xcf, 0xd3, 0xcb -> readBytes(8) != null                    // uint64 / int64 / float64
      0xd9 -> {                                                   // str8
        val n = readByte() ?: return false
        readBytes(n) != null
      }
      0xda -> {                                                   // str16
        val hi = readByte() ?: return false
        val lo = readByte() ?: return false
        readBytes((hi shl 8) or lo) != null
      }
      0xdb -> {                                                   // str32
        val raw = readBytes(4) ?: return false
        readBytes(
          ((raw[0].toInt() and 0xff) shl 24) or
            ((raw[1].toInt() and 0xff) shl 16) or
            ((raw[2].toInt() and 0xff) shl 8) or
            (raw[3].toInt() and 0xff)
        ) != null
      }
      0xc4 -> {                                                   // bin8
        val n = readByte() ?: return false
        readBytes(n) != null
      }
      0xc5 -> {                                                   // bin16
        val hi = readByte() ?: return false
        val lo = readByte() ?: return false
        readBytes((hi shl 8) or lo) != null
      }
      0xc6 -> {                                                   // bin32
        val raw = readBytes(4) ?: return false
        readBytes(
          ((raw[0].toInt() and 0xff) shl 24) or
            ((raw[1].toInt() and 0xff) shl 16) or
            ((raw[2].toInt() and 0xff) shl 8) or
            (raw[3].toInt() and 0xff)
        ) != null
      }
      else -> false
    }
  }
}
