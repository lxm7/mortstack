// AWS access key for the Cloudflare chat-ws Worker's SigV4-signed
// SNS publish (ADR-013).
//
// Provisioning is out-of-band — there is no AWS provider step that creates
// an IAM user from inside a Cloudflare Worker stack here. Standard process:
//
//   1. Create an IAM user `chat-ws-publisher` in the AWS console.
//   2. Attach an inline policy allowing `sns:Publish` on the
//      `arn:aws:sns:<region>:<account>:ChatDelivered*` topic only.
//   3. Generate an access key pair for that user.
//   4. Set both halves via SST:
//        sst secret set ChatWsAwsAccessKeyId <key>
//        sst secret set ChatWsAwsSecretAccessKey <secret>
//
// The chat-ws stack `link:`s these so the Worker receives them at deploy
// time. They never appear in source.

export const chatWsAwsAccessKeyId = new sst.Secret("ChatWsAwsAccessKeyId");
export const chatWsAwsSecretAccessKey = new sst.Secret(
  "ChatWsAwsSecretAccessKey",
);
