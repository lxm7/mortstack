// ── Content Moderation ────────────────────────────────────────────────────────
// AWS Rekognition for image/video moderation.
// No viable open-source alternative at this quality level.
//
// Flow:
//   1. User uploads media → R2
//   2. Upload Lambda publishes to SNS "MediaUploaded" topic
//   3. SNS fans out to SQS "ModerationQueue"
//   4. SQS triggers moderation Lambda → downloads from R2, sends to Rekognition
//   5. If flagged → set post.isHidden = true, increment user.reportCount
//   6. High-confidence violations → auto-ban, queue for human review
//   7. Result published to SNS "ModerationResult" topic
//
// Rekognition categories detected:
//   - Explicit/nudity
//   - Violence
//   - Hate symbols
//   - Drugs/tobacco/alcohol
//
// Note: Rekognition does NOT detect political content or text.
// Political content moderation is handled separately via community reporting.
//
// STUB: Lambda handler not yet implemented.
// The moderation Lambda is defined as a queue subscriber in events.ts.
// To activate:
//   1. Create services/moderation/src/lambda.ts
//   2. Uncomment the moderationQueue.subscribe() block in events.ts
