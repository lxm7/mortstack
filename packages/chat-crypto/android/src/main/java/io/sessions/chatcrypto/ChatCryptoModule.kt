package io.sessions.chatcrypto

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.goterl.lazysodium.LazySodiumAndroid
import com.goterl.lazysodium.SodiumAndroid
import com.goterl.lazysodium.interfaces.Box
import com.goterl.lazysodium.interfaces.GenericHash
import com.goterl.lazysodium.interfaces.Sign
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

private class ChatCryptoException(message: String) :
  CodedException("ERR_CHAT_CRYPTO", message, null)

private const val SEED_BYTES = 32
private const val NONCE_BYTES = Box.NONCEBYTES.toInt()           // 24
private const val PUBLIC_KEY_BYTES = Box.PUBLICKEYBYTES.toInt()  // 32 — same as Sign.PUBLICKEYBYTES for our purposes
private const val SIGN_SECRET_KEY_BYTES = Sign.SECRETKEYBYTES.toInt()  // 64
private const val BOX_SECRET_KEY_BYTES = Box.SECRETKEYBYTES.toInt()    // 32
private const val SIGNATURE_BYTES = Sign.BYTES.toInt()                 // 64
private const val MAC_BYTES = Box.MACBYTES.toInt()                     // 16

// Domain-separation tag for X25519 sub-seed derivation. Must match
// `x25519DerivationContext` in ChatCryptoModule.swift exactly. Bump version
// suffix only on a breaking key-identity migration.
private val X25519_DERIVATION_CONTEXT: ByteArray =
  "sessions/x25519/v1".toByteArray(Charsets.UTF_8)

// Seed persistence: AndroidKeystore-backed AES/GCM wrap of the 32-byte seed.
// Android has no keychain-access-group analogue (the M7 iOS NSE is iOS-only
// — Android FCM `data` messages decrypt inside the main app process), so we
// just isolate the key in AndroidKeystore and hand it back to the app on
// load. Same alias version suffix as iOS (chat-identity-seed-v1).
private const val SEED_KEYSTORE_ALIAS = "chat-identity-seed-v1"
private const val SEED_PREFS_NAME = "io.sessions.chat.identity"
private const val SEED_PREFS_KEY = "seed-v1"
private const val ANDROID_KEYSTORE = "AndroidKeyStore"
private const val AES_GCM_TAG_BITS = 128
private const val AES_GCM_IV_BYTES = 12

class ChatCryptoModule : Module() {
  private val lazySodium = LazySodiumAndroid(SodiumAndroid())
  private val sodium: SodiumAndroid = lazySodium.sodium as SodiumAndroid

  override fun definition() = ModuleDefinition {
    Name("ChatCrypto")

    Function("generateIdentitySeed") { ->
      randomBytes(SEED_BYTES)
    }

    Function("derivePublicKeys") { seed: ByteArray ->
      requireLen(seed, SEED_BYTES, "seed")
      val (signPub, _) = deriveSignKeypair(seed)
      val (boxPub, _) = deriveBoxKeypair(seed)
      mapOf(
        "ed25519Pub" to signPub,
        "x25519Pub" to boxPub,
      )
    }

    Function("box") {
      plaintext: ByteArray, peerX25519Pub: ByteArray, seed: ByteArray ->
      requireLen(seed, SEED_BYTES, "seed")
      requireLen(peerX25519Pub, PUBLIC_KEY_BYTES, "peerX25519Pub")
      val (_, mySecret) = deriveBoxKeypair(seed)

      val nonce = randomBytes(NONCE_BYTES)
      val cipher = ByteArray(plaintext.size + MAC_BYTES)
      val ok = sodium.crypto_box_easy(
        cipher,
        plaintext,
        plaintext.size.toLong(),
        nonce,
        peerX25519Pub,
        mySecret,
      )
      if (ok != 0) throw ChatCryptoException("crypto_box_easy failed (code $ok)")
      mapOf(
        "ciphertext" to cipher,
        "nonce" to nonce,
      )
    }

    Function("boxOpen") {
      ciphertext: ByteArray, nonce: ByteArray, peerX25519Pub: ByteArray, seed: ByteArray ->
      requireLen(seed, SEED_BYTES, "seed")
      requireLen(peerX25519Pub, PUBLIC_KEY_BYTES, "peerX25519Pub")
      requireLen(nonce, NONCE_BYTES, "nonce")
      if (ciphertext.size < MAC_BYTES + 1) {
        throw ChatCryptoException("ciphertext too short (got ${ciphertext.size}, min ${MAC_BYTES + 1})")
      }
      val (_, mySecret) = deriveBoxKeypair(seed)

      val plain = ByteArray(ciphertext.size - MAC_BYTES)
      val ok = sodium.crypto_box_open_easy(
        plain,
        ciphertext,
        ciphertext.size.toLong(),
        nonce,
        peerX25519Pub,
        mySecret,
      )
      if (ok != 0) {
        throw ChatCryptoException(
          "crypto_box_open_easy failed — bad key, bad nonce, or tampered ciphertext"
        )
      }
      plain
    }

    Function("signDetached") { message: ByteArray, seed: ByteArray ->
      requireLen(seed, SEED_BYTES, "seed")
      val (_, signSecret) = deriveSignKeypair(seed)

      val signature = ByteArray(SIGNATURE_BYTES)
      val sigLen = LongArray(1)
      val ok = sodium.crypto_sign_detached(
        signature,
        sigLen,
        message,
        message.size.toLong(),
        signSecret,
      )
      if (ok != 0) throw ChatCryptoException("crypto_sign_detached failed (code $ok)")
      signature
    }

    Function("verifyDetached") {
      message: ByteArray, signature: ByteArray, peerEd25519Pub: ByteArray ->
      requireLen(peerEd25519Pub, PUBLIC_KEY_BYTES, "peerEd25519Pub")
      requireLen(signature, SIGNATURE_BYTES, "signature")
      val ok = sodium.crypto_sign_verify_detached(
        signature,
        message,
        message.size,
        peerEd25519Pub,
      )
      ok == 0
    }

    Function("randomNonce") { ->
      randomBytes(NONCE_BYTES)
    }

    // ----- Seed persistence (AndroidKeystore-wrapped AES/GCM) -----

    Function("saveSeed") { seed: ByteArray ->
      requireLen(seed, SEED_BYTES, "seed")
      keystoreSaveSeed(seed)
    }

    Function("loadSeed") { ->
      keystoreLoadSeed()
    }

    Function("clearSeed") { ->
      keystoreClearSeed()
    }

    // ----- M3.5 Signal Protocol stubs (chunk 1C wires libsignal) -----

    Function("signalGenerateRegistrationId") { ->
      throw signalNotImplemented("signalGenerateRegistrationId")
    }

    Function("signalCreateBundle") {
      _: Int, _: Int, _: Int, _: Int, _: Int ->
      throw signalNotImplemented("signalCreateBundle")
    }

    Function("signalProcessPreKeyBundle") {
      _: Map<String, Any>, _: Map<String, Any> ->
      throw signalNotImplemented("signalProcessPreKeyBundle")
    }

    Function("signalEncrypt") {
      _: Map<String, Any>, _: ByteArray ->
      throw signalNotImplemented("signalEncrypt")
    }

    Function("signalDecrypt") {
      _: Map<String, Any>, _: Map<String, Any> ->
      throw signalNotImplemented("signalDecrypt")
    }

    Function("signalHasSession") { _: Map<String, Any> ->
      throw signalNotImplemented("signalHasSession")
    }

    Function("signalDeleteSession") { _: Map<String, Any> ->
      throw signalNotImplemented("signalDeleteSession")
    }

    Function("signalRemainingOneTimePreKeys") { ->
      throw signalNotImplemented("signalRemainingOneTimePreKeys")
    }
  }

  private fun signalNotImplemented(name: String): ChatCryptoException =
    ChatCryptoException("M3.5 $name not yet implemented (chunk 1C pending)")

  // ----- helpers -----

  private fun randomBytes(n: Int): ByteArray {
    val buf = ByteArray(n)
    sodium.randombytes_buf(buf, n)
    return buf
  }

  private fun requireLen(arr: ByteArray, expected: Int, name: String) {
    if (arr.size != expected) {
      throw ChatCryptoException("$name must be $expected bytes, got ${arr.size}")
    }
  }

  private fun deriveSignKeypair(seed: ByteArray): Pair<ByteArray, ByteArray> {
    val pub = ByteArray(PUBLIC_KEY_BYTES)
    val sec = ByteArray(SIGN_SECRET_KEY_BYTES)
    val ok = sodium.crypto_sign_seed_keypair(pub, sec, seed)
    if (ok != 0) throw ChatCryptoException("crypto_sign_seed_keypair failed (code $ok)")
    return pub to sec
  }

  // X25519 sub-seed = BLAKE2b(seed, key: X25519_DERIVATION_CONTEXT, outLen: 32).
  // Domain-separated from the Ed25519 keypair.
  private fun deriveBoxKeypair(seed: ByteArray): Pair<ByteArray, ByteArray> {
    val subSeed = ByteArray(SEED_BYTES)
    val ok = sodium.crypto_generichash(
      subSeed,
      SEED_BYTES,
      seed,
      seed.size.toLong(),
      X25519_DERIVATION_CONTEXT,
      X25519_DERIVATION_CONTEXT.size,
    )
    if (ok != 0) throw ChatCryptoException("crypto_generichash failed (code $ok)")

    val pub = ByteArray(PUBLIC_KEY_BYTES)
    val sec = ByteArray(BOX_SECRET_KEY_BYTES)
    val ok2 = sodium.crypto_box_seed_keypair(pub, sec, subSeed)
    if (ok2 != 0) throw ChatCryptoException("crypto_box_seed_keypair failed (code $ok2)")
    return pub to sec
  }

  // ----- Keystore helpers -----

  private val androidContext: Context
    get() = appContext.reactContext
      ?: throw ChatCryptoException("Android Context unavailable")

  private fun getOrCreateKeystoreKey(): SecretKey {
    val ks = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
    val existing = ks.getKey(SEED_KEYSTORE_ALIAS, null) as? SecretKey
    if (existing != null) return existing

    val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE)
    val spec = KeyGenParameterSpec.Builder(
      SEED_KEYSTORE_ALIAS,
      KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
    )
      .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
      .setKeySize(256)
      .setRandomizedEncryptionRequired(true)
      .build()
    gen.init(spec)
    return gen.generateKey()
  }

  private fun keystoreSaveSeed(seed: ByteArray) {
    val key = getOrCreateKeystoreKey()
    val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply {
      init(Cipher.ENCRYPT_MODE, key)
    }
    val iv = cipher.iv
    val ct = cipher.doFinal(seed)
    val packed = ByteArray(iv.size + ct.size).also {
      System.arraycopy(iv, 0, it, 0, iv.size)
      System.arraycopy(ct, 0, it, iv.size, ct.size)
    }
    val encoded = Base64.encodeToString(packed, Base64.NO_WRAP)
    androidContext
      .getSharedPreferences(SEED_PREFS_NAME, Context.MODE_PRIVATE)
      .edit()
      .putString(SEED_PREFS_KEY, encoded)
      .apply()
  }

  private fun keystoreLoadSeed(): ByteArray? {
    val encoded = androidContext
      .getSharedPreferences(SEED_PREFS_NAME, Context.MODE_PRIVATE)
      .getString(SEED_PREFS_KEY, null) ?: return null
    val packed = Base64.decode(encoded, Base64.NO_WRAP)
    if (packed.size <= AES_GCM_IV_BYTES) {
      throw ChatCryptoException("stored seed payload too short (${packed.size}B)")
    }
    val iv = packed.copyOfRange(0, AES_GCM_IV_BYTES)
    val ct = packed.copyOfRange(AES_GCM_IV_BYTES, packed.size)
    val key = getOrCreateKeystoreKey()
    val cipher = Cipher.getInstance("AES/GCM/NoPadding").apply {
      init(Cipher.DECRYPT_MODE, key, GCMParameterSpec(AES_GCM_TAG_BITS, iv))
    }
    return cipher.doFinal(ct)
  }

  private fun keystoreClearSeed(): Boolean {
    val prefs = androidContext.getSharedPreferences(SEED_PREFS_NAME, Context.MODE_PRIVATE)
    val had = prefs.contains(SEED_PREFS_KEY)
    prefs.edit().remove(SEED_PREFS_KEY).apply()
    runCatching {
      val ks = KeyStore.getInstance(ANDROID_KEYSTORE).apply { load(null) }
      if (ks.containsAlias(SEED_KEYSTORE_ALIAS)) ks.deleteEntry(SEED_KEYSTORE_ALIAS)
    }
    return had
  }
}
