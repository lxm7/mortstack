// ── Real-time Updates ────────────────────────────────────────────────────────
// Strategy: Push notifications (Expo Push) + client-side polling for feeds.
//
// WebSocket is DEFERRED — API Gateway WebSocket costs ~$13,000/mo at 10M users
// (300K concurrent connections). Push notifications + polling covers 95% of
// social media UX (Instagram, TikTok, early Twitter all used this pattern).
//
// If real-time WebSocket is needed later (chat, live art auctions, live streams):
//   - Deploy WebSocket server on ECS Fargate (~10x cheaper than API GW at scale)
//   - Use DynamoDB for connectionId store (TTL, no VPC needed)
//   - Fan-out via SNS "UserActivity" → SQS "BroadcastQueue" → Fargate WebSocket
//
// Current real-time flow:
//   1. User action → API Lambda → SNS topic
//   2. SNS → SQS NotificationQueue → Notification Lambda → Expo Push API
//   3. Client receives push notification
//   4. Client pulls fresh data on next feed refresh
