// ── Push Notifications ──────────────────────────────────────────────────────
// Consumes SQS events and sends push notifications via Expo Push API.
// Expo Push is free, wraps APNs + FCM, handles token management.
//
// Events consumed (via SQS "NotificationQueue"):
//   - media.uploaded  → "X posted new artwork"
//   - post.liked      → "X liked your post"
//   - follow.new      → "X started following you"
//   - comment.created → "X commented on your post"
//   - nft.sold        → "Your NFT sold for X SUI"
//   - nft.minted      → "X minted a new NFT"
//
// STUB: Lambda handler not yet implemented.
// The notification Lambda is defined as a queue subscriber in events.ts.
// To activate:
//   1. Create services/notifications/src/lambda.ts
//   2. Store Expo push tokens in DB (on device registration)
//   3. Uncomment the notificationQueue.subscribe() block in events.ts
