// SNS publish from the Cloudflare Worker (ADR-013).
//
// After the Chat DO writes a batch to Neon, it publishes one
// `chat.msg.delivered` event per persisted message. The chat-push Lambda
// (M6) consumes the queue, looks up offline recipients, and dispatches
// encrypted payloads to APNs/FCM.
//
// SigV4 signing via aws4fetch — ~6KB, V8-isolate safe, no AWS SDK needed.
// Failure mode: publish failure does NOT block ack to the sender. The
// message is already persisted; a reconciliation Worker (deferred) will
// catch missed pushes.

import { AwsClient } from "aws4fetch";

export interface ChatDeliveredEvent {
  // Routing
  chatId: string;
  serverMsgId: string; // stringified serverSerial
  senderId: string;
  recipientIds: string[]; // members minus sender; subset may already be online
  // Opaque encrypted payload — base64 for SNS message body (JSON only).
  ciphertextB64: string;
  nonceB64: string;
  ts: number;
}

let cachedClient: { region: string; client: AwsClient } | null = null;

function getClient(env: Env): AwsClient {
  if (cachedClient && cachedClient.region === env.AWS_REGION) {
    return cachedClient.client;
  }
  // TODO(M6): linked SST secrets on CF Workers come via Resource.X.value, not
  // env. Currently `env.CHAT_WS_AWS_ACCESS_KEY_ID` / `..._SECRET_ACCESS_KEY`
  // resolve to the literal "undefined" string, so SigV4 publish will 401. Swap
  // to `Resource.ChatWsAwsAccessKeyId.value` + drop the env decls from
  // worker-configuration.d.ts when push fanout (ADR-013) goes live.
  cachedClient = {
    region: env.AWS_REGION,
    client: new AwsClient({
      accessKeyId: env.CHAT_WS_AWS_ACCESS_KEY_ID,
      secretAccessKey: env.CHAT_WS_AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      service: "sns",
    }),
  };
  return cachedClient.client;
}

// Publish a single chat.msg.delivered event. SNS expects form-encoded body
// for the legacy publish action; using the standard PublishCommand shape.
export async function publishChatDelivered(
  env: Env,
  event: ChatDeliveredEvent,
): Promise<boolean> {
  if (!env.CHAT_DELIVERED_TOPIC_ARN) return false;
  if (event.recipientIds.length === 0) return true;

  const client = getClient(env);
  const endpoint = `https://sns.${env.AWS_REGION}.amazonaws.com/`;

  const body = new URLSearchParams({
    Action: "Publish",
    Version: "2010-03-31",
    TopicArn: env.CHAT_DELIVERED_TOPIC_ARN,
    Message: JSON.stringify(event),
    // Attribute hint so the consumer Lambda can filter without parsing body.
    "MessageAttributes.entry.1.Name": "kind",
    "MessageAttributes.entry.1.Value.DataType": "String",
    "MessageAttributes.entry.1.Value.StringValue": "chat.msg.delivered",
  });

  try {
    const resp = await client.fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}
