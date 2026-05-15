// import { secrets } from './secrets';

// ── Event Bus (SNS + SQS) ───────────────────────────────────────────────────
// Fan-out pattern: SNS topics broadcast events → SQS queues decouple consumers.
// Each consumer gets its own queue with independent retry, DLQ, and scaling.
// Adding a new consumer = add another SQS subscription. Zero changes to publishers.
//
// Publishers:
//   - API Lambda          → mediaUploaded, userActivity
//   - Upload Lambda       → mediaUploaded
//   - SUI Indexer (ECS)   → chainEvent
//   - Moderation Lambda   → moderationResult (after processing)
//
// Cost: SNS first 1M publishes/mo free, SQS first 1M requests/mo free.
//       At 10M users (~1.5B events/mo): ~$1,350/mo total.

// ── SNS Topics ──────────────────────────────────────────────────────────────

/** Fired when media is uploaded to R2 (images, audio, video). */
export const mediaUploadedTopic = new sst.aws.SnsTopic("MediaUploaded");

/** Fired on user engagement actions (like, follow, comment, share). */
export const userActivityTopic = new sst.aws.SnsTopic("UserActivity");

/** Fired by SUI indexer on blockchain events (NFT minted, listed, transferred). */
export const chainEventTopic = new sst.aws.SnsTopic("ChainEvent");

/** Fired after moderation Lambda processes media (flagged/approved). */
export const moderationResultTopic = new sst.aws.SnsTopic("ModerationResult");

/**
 * Fired by chat-ws Worker (Chat DO) after a message batch is persisted
 * to Neon (ADR-013). Payload contains ciphertext + nonce + recipientIds;
 * the chat-push Lambda decides who is offline and dispatches APNs/FCM.
 * Plaintext never crosses the bus — push relay is content-blind.
 */
export const chatDeliveredTopic = new sst.aws.SnsTopic("ChatDelivered");

// ── SQS Queues ──────────────────────────────────────────────────────────────

/** Moderation queue — consumes media.uploaded, triggers Rekognition analysis. */
export const moderationQueue = new sst.aws.Queue("ModerationQueue", {
  visibilityTimeout: "6 minutes", // > moderation Lambda timeout (5 min)
});

/** Notification queue — consumes user.activity + chain.event, sends Expo push. */
export const notificationQueue = new sst.aws.Queue("NotificationQueue", {
  visibilityTimeout: "1 minute",
});

/**
 * Chat push queue — consumes chat.msg.delivered, dispatches encrypted
 * payloads to FCM/APNs for offline recipients (ADR-013).
 * Decoupled from notificationQueue so chat push latency doesn't compete
 * with social-activity push throughput.
 */
export const chatPushQueue = new sst.aws.Queue("ChatPushQueue", {
  visibilityTimeout: "1 minute",
});

// ── Fan-out Subscriptions ───────────────────────────────────────────────────
// media.uploaded → moderation queue (content safety check)
// media.uploaded → notification queue (notify followers of new post)
mediaUploadedTopic.subscribeQueue("ModerationConsumer", moderationQueue.arn);
mediaUploadedTopic.subscribeQueue("MediaNotifyConsumer", notificationQueue.arn);

// user.activity → notification queue (likes, follows, comments)
userActivityTopic.subscribeQueue(
  "ActivityNotifyConsumer",
  notificationQueue.arn,
);

// chain.event → notification queue (NFT sold, minted)
chainEventTopic.subscribeQueue("ChainNotifyConsumer", notificationQueue.arn);

// chat.msg.delivered → chat push queue (ADR-013)
chatDeliveredTopic.subscribeQueue("ChatPushConsumer", chatPushQueue.arn);

// ── Queue → Lambda Subscriptions ────────────────────────────────────────────
// These wire SQS queues to Lambda consumers.
// Uncomment as handlers are implemented.

// moderationQueue.subscribe({
//   handler: 'services/moderation/src/lambda.handler',
//   runtime: 'nodejs22.x',
//   architecture: 'arm64',
//   memory: '1024 MB',
//   timeout: '5 minutes',
//   link: [...secrets],
//   permissions: [
//     {
//       actions: [
//         'rekognition:DetectModerationLabels',
//         'rekognition:DetectLabels',
//         'rekognition:StartContentModeration',
//         'rekognition:GetContentModeration',
//       ],
//       resources: ['*'],
//     },
//   ],
// });

// notificationQueue.subscribe({
//   handler: 'services/notifications/src/lambda.handler',
//   runtime: 'nodejs22.x',
//   architecture: 'arm64',
//   memory: '256 MB',
//   timeout: '30 seconds',
//   link: [...secrets],
// });

// chat-push Lambda — APNs/FCM dispatch for offline chat recipients.
// Activates when M6 (push notifications) ships; the handler decrypts nothing,
// only routes ciphertext to device tokens for users not currently attached.
//
// chatPushQueue.subscribe({
//   handler: 'services/chat-push/src/lambda.handler',
//   runtime: 'nodejs22.x',
//   architecture: 'arm64',
//   memory: '256 MB',
//   timeout: '30 seconds',
//   link: [...secrets],
// });

export const events = {
  mediaUploadedTopic,
  userActivityTopic,
  chainEventTopic,
  moderationResultTopic,
  chatDeliveredTopic,
  moderationQueue,
  notificationQueue,
  chatPushQueue,
};
