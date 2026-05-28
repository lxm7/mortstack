// SessionsFirebaseMessagingService — Android-side counterpart to the iOS
// NSE (M6, ADR-013). Handles data-only FCM messages: decrypts the MLS
// application payload via the sealed snapshot and posts a NotificationCompat
// with plaintext.
//
// Stale-snapshot fallback: any failure → generic "New message" alert. No
// plaintext leak when keys are out of sync.

package io.sessions.app.push

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class SessionsFirebaseMessagingService : FirebaseMessagingService() {

  override fun onMessageReceived(message: RemoteMessage) {
    val data = message.data
    val ciphertextB64 = data["c"]
    val nonceB64 = data["n"]
    val chatId = data["chatId"]
    val serverMsgId = data["serverMsgId"]

    if (ciphertextB64 == null || nonceB64 == null || chatId == null) {
      postGeneric(serverMsgId)
      return
    }

    val plaintext = try {
      MlsAndroidDecryptor.decrypt(
        context = applicationContext,
        ciphertextB64 = ciphertextB64,
        nonceB64 = nonceB64
      )
    } catch (_: Throwable) {
      postGeneric(serverMsgId)
      return
    }

    postPlaintext(plaintext.title, plaintext.body, serverMsgId)
  }

  override fun onNewToken(token: String) {
    super.onNewToken(token)
    // Token refresh — the JS layer reads expo-notifications which surfaces
    // a `tokenChange` listener; nothing to do here besides logging. The JS
    // boot path re-registers on next launch.
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private fun postGeneric(serverMsgId: String?) {
    postPlaintext("New message", "Open the app to view", serverMsgId)
  }

  private fun postPlaintext(title: String, body: String, serverMsgId: String?) {
    ensureChannel()
    val builder = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(applicationInfo.icon)
      .setContentTitle(title)
      .setContentText(body)
      .setAutoCancel(true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
    // collapse_key from FCM only de-dupes at the transport layer. Use the
    // same serverMsgId as the local notification id so a re-send replaces
    // any stale alert instead of stacking.
    val notifId = serverMsgId?.hashCode() ?: System.currentTimeMillis().toInt()
    NotificationManagerCompat.from(this).notify(notifId, builder.build())
  }

  private fun ensureChannel() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val ch = NotificationChannel(
      CHANNEL_ID,
      "Chat messages",
      NotificationManager.IMPORTANCE_HIGH
    )
    val mgr = getSystemService(Context.NOTIFICATION_SERVICE)
      as NotificationManager
    mgr.createNotificationChannel(ch)
  }

  companion object {
    private const val CHANNEL_ID = "chat-messages"
  }
}
