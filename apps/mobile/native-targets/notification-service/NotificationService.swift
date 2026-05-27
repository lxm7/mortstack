// NotificationService — iOS NSE for M6 chat push (ADR-013).
//
// Runs in a sandboxed extension process. Receives the data-only APNs
// payload, decrypts the MLS application message using the sealed snapshot
// the main app writes after every commit/welcome/encrypt, and rewrites
// `bestAttemptContent` with the plaintext sender + body before iOS shows
// the notification.
//
// Stale-snapshot fallback (ADR-015 §M6): if decryption fails for ANY
// reason — missing snapshot, unknown epoch, malformed ciphertext, key
// mismatch — we present a generic "New message" alert. NO plaintext leaks
// when keys are out of sync; the app is the source of truth and will
// finish decrypt on next open.

import UserNotifications
import Sodium

class NotificationService: UNNotificationServiceExtension {
  var contentHandler: ((UNNotificationContent) -> Void)?
  var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    self.bestAttemptContent =
      request.content.mutableCopy() as? UNMutableNotificationContent

    guard let content = self.bestAttemptContent else {
      contentHandler(request.content)
      return
    }

    // APNs userInfo carries the data fields the chat-push Lambda set:
    //   chatId, serverMsgId, senderId, c (ciphertext b64), n (nonce b64)
    let info = request.content.userInfo
    guard
      let ciphertextB64 = info["c"] as? String,
      let nonceB64 = info["n"] as? String,
      let _ = info["chatId"] as? String
    else {
      finishWithGenericFallback(content, contentHandler)
      return
    }

    // Attempt decrypt. Any failure → generic fallback.
    do {
      let plaintext = try MlsNseDecryptor.shared.decrypt(
        ciphertextB64: ciphertextB64,
        nonceB64: nonceB64
      )
      content.title = plaintext.title
      content.body = plaintext.body
      // Drop `c` / `n` from userInfo so the launched app doesn't redundantly
      // re-decrypt — local DB will have the row by then anyway.
      var sanitized = content.userInfo
      sanitized.removeValue(forKey: "c")
      sanitized.removeValue(forKey: "n")
      content.userInfo = sanitized
      contentHandler(content)
    } catch {
      finishWithGenericFallback(content, contentHandler)
    }
  }

  override func serviceExtensionTimeWillExpire() {
    // OS gives us ~30 seconds; if we ran out, surface a generic alert.
    if let content = bestAttemptContent, let handler = contentHandler {
      finishWithGenericFallback(content, handler)
    }
  }

  private func finishWithGenericFallback(
    _ content: UNMutableNotificationContent,
    _ contentHandler: (UNNotificationContent) -> Void
  ) {
    content.title = "New message"
    content.body = "Open the app to view"
    contentHandler(content)
  }
}
