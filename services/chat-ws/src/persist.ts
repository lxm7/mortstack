// Chat DO calls this to persist a batch of messages to Postgres via the API
// Lambda. HMAC-signed (shared secret in env.CHAT_WS_HMAC_SECRET) so the
// internal endpoint can refuse anything not coming from the Worker.
//
// Per F1 (await-then-ack): the Chat DO awaits a successful response before
// sending `ack` frames to senders or fanning out `msg` frames to recipients.
// On failure, the caller should send `err` frames and decide on retry policy.

export interface PersistBatchInput {
  chatId: string;
  messages: Array<{
    clientMsgId: string;
    senderId: string;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
  }>;
}

export interface PersistedRow {
  clientMsgId: string;
  serverMsgId: string;
  ts: number;
}

export interface PersistBatchResult {
  rows: PersistedRow[];
  // Member userIds the API determined need to be notified by push (offline at
  // persist time). Empty when everyone is currently connected.
  pushTargets: string[];
}

export async function persistBatch(
  env: Env,
  input: PersistBatchInput,
): Promise<PersistBatchResult> {
  const url = `${env.API_INTERNAL_URL.replace(/\/$/, "")}/internal/chat/persist`;

  // ciphertext + nonce are bytes — encode as base64 for JSON transport. The
  // Lambda decodes back to bytea on the way into Postgres.
  const body = JSON.stringify({
    chatId: input.chatId,
    messages: input.messages.map((m) => ({
      clientMsgId: m.clientMsgId,
      senderId: m.senderId,
      ciphertext: bytesToBase64(m.ciphertext),
      nonce: bytesToBase64(m.nonce),
    })),
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-chat-ws-secret": env.CHAT_WS_HMAC_SECRET,
    },
    body,
  });

  if (!resp.ok) {
    throw new Error(`persist failed: ${resp.status} ${await resp.text()}`);
  }

  return (await resp.json()) as PersistBatchResult;
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}
