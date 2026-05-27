// Local message persistence — M4-followup #25. Writes decrypted plaintext
// to chat-db so cold-app starts can rehydrate thread state. MLS forward
// secrecy makes this load-bearing: each ciphertext can only be decrypted
// once, so the engine ratchet would otherwise lose access to the plaintext
// on every relaunch.

import type { DB } from "@op-engineering/op-sqlite";
import type { ChatDbHandle } from "./client";

// Minimal shape consumed by chat store hydration — keep aligned with
// @repo/chat's Message type, but defined here so this package stays free
// of chat-pkg imports.
export interface PersistedMessageInput {
  /** Server-assigned id for confirmed messages. Pass clientMsgId for
   *  pending (status="sending") rows; confirm will rewrite once acked. */
  id: string;
  chatId: string;
  senderAuthUserId: string;
  text: string;
  status: "sending" | "sent" | "failed";
  clientMsgId: string;
  serverSerial: string | null;
  /** Authoritative server timestamp when known; sender's local clock for
   *  pending rows. Unix ms. */
  createdAt: number;
}

export interface PersistedMessage {
  id: string;
  chatId: string;
  senderAuthUserId: string;
  text: string;
  status: "sending" | "sent" | "failed";
  clientMsgId: string;
  serverSerial: string | null;
  createdAt: number;
}

export async function persistMessage(
  db: DB,
  input: PersistedMessageInput,
): Promise<void> {
  // UPSERT on PRIMARY KEY (id). On conflict we update status + plaintext +
  // sent_at + received_at — covers the optimistic→confirmed transition
  // (caller switches id from clientMsgId to serverMsgId on confirm).
  await db.execute(
    `INSERT INTO messages
       (id, chat_id, sender_id, ciphertext, nonce, sent_at, received_at, status, plaintext, client_msg_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       sender_id      = excluded.sender_id,
       sent_at        = excluded.sent_at,
       received_at    = excluded.received_at,
       status         = excluded.status,
       plaintext      = excluded.plaintext,
       client_msg_id  = excluded.client_msg_id`,
    [
      input.id,
      input.chatId,
      input.senderAuthUserId,
      // ciphertext/nonce are pre-M4-followup schema fields that we no longer
      // populate from the chat store path — pass empty BLOBs to satisfy the
      // NOT NULL constraints inherited from migration v1.
      new Uint8Array(0),
      new Uint8Array(0),
      input.createdAt,
      input.status === "sent" ? input.createdAt : null,
      mapStatus(input.status),
      input.text,
      input.clientMsgId,
    ],
  );
}

export async function loadMessagesForChat(
  db: DB,
  chatId: string,
  limit = 200,
): Promise<PersistedMessage[]> {
  const result = await db.execute(
    `SELECT id, chat_id, sender_id, sent_at, received_at, status, plaintext, client_msg_id
       FROM messages
      WHERE chat_id = ? AND plaintext IS NOT NULL
      ORDER BY sent_at ASC
      LIMIT ?`,
    [chatId, limit],
  );
  const rows = (result.rows ?? []) as unknown as Array<{
    id: string;
    chat_id: string;
    sender_id: string;
    sent_at: number;
    received_at: number | null;
    status: string;
    plaintext: string | null;
    client_msg_id: string | null;
  }>;
  return rows
    .filter((r) => r.plaintext !== null)
    .map((r) => ({
      id: r.id,
      chatId: r.chat_id,
      senderAuthUserId: r.sender_id,
      text: r.plaintext ?? "",
      status: unmapStatus(r.status),
      clientMsgId: r.client_msg_id ?? r.id,
      serverSerial: r.status === "sent" ? r.id : null,
      createdAt: r.sent_at,
    }));
}

function mapStatus(s: PersistedMessageInput["status"]): MessageRowStatus {
  if (s === "sending") return "pending";
  if (s === "failed") return "failed";
  return "sent";
}

function unmapStatus(s: string): "sending" | "sent" | "failed" {
  if (s === "pending") return "sending";
  if (s === "failed") return "failed";
  return "sent";
}

type MessageRowStatus = "pending" | "sent" | "delivered" | "failed";

// ── Bound helpers for the @repo/chat store injection ────────────────────
// Mirrors the createBoundMlsStore pattern: chat-mls-core never sees a DB
// type; mobile builds the bound API once.
export interface MessagePersistApi {
  persist(input: PersistedMessageInput): Promise<void>;
  load(chatId: string, limit?: number): Promise<PersistedMessage[]>;
}

export function createBoundMessageStore(handle: ChatDbHandle) {
  const db = handle.db;
  return {
    persist: (input: PersistedMessageInput) => persistMessage(db, input),
    // Normalise serverSerial null → undefined so the return shape lines up
    // structurally with @repo/chat's Message type without a cast at the
    // call site.
    load: async (chatId: string, limit?: number) => {
      const rows = await loadMessagesForChat(db, chatId, limit);
      return rows.map((r) => ({
        id: r.id,
        chatId: r.chatId,
        senderAuthUserId: r.senderAuthUserId,
        text: r.text,
        status: r.status,
        clientMsgId: r.clientMsgId,
        serverSerial: r.serverSerial ?? undefined,
        createdAt: r.createdAt,
      }));
    },
  };
}
