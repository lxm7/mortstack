import { vpc } from './vpc';
import { secrets } from './secrets';

// ── Content Moderation ────────────────────────────────────────────────────────
// AWS Rekognition for image/video moderation.
// No viable open-source alternative at this quality level.
//
// Flow:
//   1. User uploads media → R2
//   2. R2 upload triggers moderation Lambda (via Upstash Kafka event)
//   3. Lambda downloads from R2, sends to Rekognition
//   4. If flagged → set post.isHidden = true, increment user.reportCount
//   5. High-confidence violations → auto-ban, queue for human review
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
// STUB: IAM permissions defined, Lambda handler not yet implemented.

// ── IAM permissions ───────────────────────────────────────────────────────────
// Lambda role will need these policies to call Rekognition
// SST attaches these automatically when you `link` AWS service permissions
// For now we define the moderation function stub

export const moderationFunction = new sst.aws.Function('Moderation', {
  handler: 'services/moderation/src/lambda.handler',
  runtime: 'nodejs22.x',
  architecture: 'arm64',
  memory: 1024,             // Rekognition image analysis is memory-intensive
  timeout: '5 minutes',
  link: [...secrets],
  permissions: [
    {
      // Grant access to Rekognition
      actions: [
        'rekognition:DetectModerationLabels',
        'rekognition:DetectLabels',
        'rekognition:StartContentModeration',
        'rekognition:GetContentModeration',
      ],
      resources: ['*'],
    },
  ],
  // TODO: Uncomment when services/moderation is created
  // enabled: false, // Not deployed until handler exists
});

// TODO: Subscribe moderation function to Upstash Kafka 'media.uploaded' topic
// This will be configured when Kafka integration is implemented
