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
import io.sessions.app.chat_mls_core.ChatMlsCore
import org.json.JSONObject
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

    val plaintextBytes = ChatMlsCore.engineForNse(snapshot)
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
    val json = JSONObject(String(bytes, Charsets.UTF_8))
    return Plaintext(
      title = json.optString("sender", "New message"),
      body = json.optString("body", "Open the app to view")
    )
  }
}
