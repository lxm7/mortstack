export interface ChatRow {
  id: string;
  kind: "direct" | "group";
  title: string | null;
  created_at: number;
  updated_at: number;
  last_message_id: string | null;
}

export interface MessageRow {
  id: string;
  chat_id: string;
  sender_id: string;
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  sent_at: number;
  received_at: number | null;
  status: "pending" | "sent" | "delivered" | "failed";
}

export interface MemberRow {
  chat_id: string;
  account_id: string;
  role: "owner" | "admin" | "member";
  joined_at: number;
  identity_pubkey: Uint8Array;
}

export interface SyncCursorRow {
  chat_id: string;
  last_seen_message_id: string | null;
  last_synced_at: number;
}

export interface PendingOutboxRow {
  id: string;
  chat_id: string;
  payload: Uint8Array;
  idempotency_key: string;
  attempts: number;
  next_attempt_at: number;
  created_at: number;
  last_error: string | null;
}

export interface KeyMaterialRow {
  account_id: string;
  identity_pub: Uint8Array;
  identity_priv: Uint8Array;
  created_at: number;
}
