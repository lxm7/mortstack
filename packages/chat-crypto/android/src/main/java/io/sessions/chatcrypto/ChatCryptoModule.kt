package io.sessions.chatcrypto

import com.goterl.lazysodium.LazySodiumAndroid
import com.goterl.lazysodium.SodiumAndroid
import com.goterl.lazysodium.interfaces.Box
import com.goterl.lazysodium.interfaces.GenericHash
import com.goterl.lazysodium.interfaces.Sign
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

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
  }

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
}
