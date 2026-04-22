import { secrets } from './secrets';

// ── Push Notifications Lambda ────────────────────────────────────────────────
// Consumes Kafka events and sends push notifications via Expo Push API.
// Expo Push is free, wraps APNs + FCM, handles token management.
//
// Events consumed:
//   - post.liked      → "X liked your post"
//   - follow.new      → "X started following you"
//   - comment.created → "X commented on your post"
//   - nft.sold        → "Your NFT sold for X SUI"
//
// STUB: Handler not yet implemented.
// To activate:
//   1. Create services/notifications/src/lambda.ts
//   2. Store Expo push tokens in DB (on device registration)
//   3. Subscribe to Upstash Kafka topic
//   4. Uncomment below

// export const notificationFunction = new sst.aws.Function('Notifications', {
//   handler: 'services/notifications/src/lambda.handler',
//   runtime: 'nodejs22.x',
//   architecture: 'arm64',
//   memory: 256,
//   timeout: '30 seconds',
//   link: [...secrets],
// });
