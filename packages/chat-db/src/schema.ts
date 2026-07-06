export interface ChatRow {
  id: string;
  kind: "direct" | "group";
  title: string | null;
  created_at: number;
  updated_at: number;
  last_message_id: string | null;
  // MLS GroupId bytes — null for legacy v=1 libsodium 1:1 chats, populated
  // for every v=2 chat created post-M3.5. See ADR-015 §7.
  mls_group_id: Uint8Array | null;
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
  /** Decrypted text, persisted after first successful MLS decrypt. SQLCipher
   *  protects at rest. Null on pre-M4 rows + on transient pending sends
   *  whose plaintext hasn't been written yet. */
  plaintext: string | null;
  /** Sender's locally-generated id — matches the optimistic-send entry's
   *  clientMsgId so confirm can update the right row. Null for pure
   *  incoming messages where we never had a local optimistic entry. */
  client_msg_id: string | null;
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

// Offline backfill cursor (docs/message-backfill.md). One row per chat this
// device has backfilled. last_serial = greatest serverSerial pulled so far,
// TEXT because a serverSerial (BigInt) can exceed JS 2^53.
export interface BackfillCursorRow {
  chat_id: string;
  last_serial: string;
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
// The MLS BasicCredential signature key reuses ed25519_pub above (ADR-015
// §5) — no separate mls_credential column is needed locally.
export interface PeerDeviceRow {
  account_id: string;
  device_id: string;
  ed25519_pub: Uint8Array;
  x25519_pub: Uint8Array;
  refreshed_at: number;
  server_updated_at: number;
}

// Whole-blob snapshot of the OpenMLS engine state for this account. Single
// row per account (groups, KeyPackages, signature keys all live inside).
// Written after every mutating engine call by the chat-mls-core/client SDK.
// Replaced by per-entry rows in M8 via a custom StorageProvider impl
// (ADR-015 follow-up — deferred because Phase 1 ≤50 groups → snapshots are
// <500KB and op-sqlite writes complete in <5ms).
export interface MlsEngineStateRow {
  account_id: string;
  snapshot: Uint8Array;
  updated_at: number;
}

// Local registry of MLS groups this device has joined. The Delivery Service
// poll uses last_applied_epoch as the cursor: each fetchPendingCommits call
// fetches with `sinceEpoch = last_applied_epoch + 1`, then bumps the cursor
// to the highest epoch successfully applied. chat_id is nullable for the
// brief window between MLS createGroup and the Chat row being written
// server-side.
export interface MlsGroupRow {
  group_id: Uint8Array;
  chat_id: string | null;
  last_applied_epoch: number;
  joined_at: number;
}
