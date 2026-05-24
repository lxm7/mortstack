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

// One row per (peer account, device). Local mirror of the server's
// UserDevice directory, refreshed via tRPC user.keys.byUserIds.
// refreshed_at = local epoch-ms the row was last fetched (drives the 24h TTL).
// server_updated_at = the server-side UserDevice.updatedAt (for diagnostics).
//
// MLS columns (Chunk 4) will land here as `mls_credential_id` + similar —
// no signal_device_id column was retained, see ADR-015.
export interface PeerDeviceRow {
  account_id: string;
  device_id: string;
  ed25519_pub: Uint8Array;
  x25519_pub: Uint8Array;
  refreshed_at: number;
  server_updated_at: number;
}
