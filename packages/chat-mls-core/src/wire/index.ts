// Wire schemas for the mls.* tRPC namespace. Lives under a subpath export
// (`@repo/chat-mls-core/wire`) so the server can import these without pulling
// the Expo Native module deps. Server (services/api) and client (mobile)
// import the same module — single source of truth for the MLS HTTP boundary.
//
// All opaque MLS blobs travel as base64. Raw bytes land in Postgres `bytea`
// (encoding lives only at the HTTP boundary, matching user.keys.publish in
// routers/user.ts).
//
// Versioning: every signed canonical-bytes blob in this layer carries a
// leading version byte. v=0x01 is the M3 device-bundle sig (in user.ts);
// v=0x02 is the M3.5 MLS publish proof (below). Server gates on the version
// byte before verifying.

import { z } from "zod";

// ── Tunables ────────────────────────────────────────────────────────────────
// Centralised here so the server router and client SDK agree without a
// secondary copy. Numbers chosen per ADR-015 + the Phase 1 scale model in
// schema.prisma (KeyPackage / GroupCommit / GroupWelcome model headers).

/** Server-side per-device cap. publishKeyPackages tx rejects when
 *  `existing + incoming > CAP`. 2× the normal pool size of 100; absorbs
 *  racing top-ups without permitting flood-fill (ADR-015 design point #3). */
export const KEY_PACKAGE_PER_DEVICE_CAP = 200;

/** Max KeyPackages a single publish call may submit. Limits worst-case
 *  signature-verify CPU on the API Lambda (one Ed25519 verify per publish
 *  call regardless of batch size — see MLS_PUBLISH_PROOF_VERSION below). */
export const KEY_PACKAGE_PUBLISH_BATCH_MAX = 50;

/** Max accountIds a single fetchKeyPackagesForAccounts may resolve. Bounds
 *  the SELECT … FOR UPDATE SKIP LOCKED footprint on the consume tx. */
export const FETCH_KEY_PACKAGES_ACCOUNTS_MAX = 100;

/** Max GroupCommit rows returned per fetchPendingCommits call. Caller
 *  paginates by passing the last-seen epoch as `sinceEpoch` on the next
 *  call. 100 commits is ~100KB at Phase 1 sizes — fits a single Lambda
 *  response comfortably. */
export const FETCH_PENDING_COMMITS_PAGE_MAX = 100;

/** Max GroupWelcome rows returned per fetchPendingWelcomes call. Welcomes
 *  are small and rare; 50 is plenty for a polling client catching up. */
export const FETCH_PENDING_WELCOMES_PAGE_MAX = 50;

/** Soft upper bounds on individual MLS blob sizes at the HTTP boundary.
 *  The server never parses the bytes; these bounds protect the Lambda from
 *  pathological payloads. Numbers picked from RFC 9420 §5 ciphersuite
 *  MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519 (the ADR-015 §3 pick).
 *
 *  KeyPackage:  typical 600–800B raw → 4KB B64-safe ceiling.
 *  Welcome:     scales linearly with new-joiner count; 8KB covers a
 *               10-person add comfortably.
 *  Commit:      O(log N) tree path + leaves; 64KB covers groups well into
 *               the thousands before MLS Resync would trigger. */
export const MLS_KEY_PACKAGE_MAX_BYTES = 4 * 1024;
export const MLS_WELCOME_MAX_BYTES = 8 * 1024;
export const MLS_COMMIT_MAX_BYTES = 64 * 1024;

/** GroupId convention is 32B (SHA-256 of an opaque label or random 32B).
 *  Mirrors `MLS_GROUP_ID_BYTES` in ChatMlsCore.types.ts — kept here too so
 *  the wire layer doesn't pull the RN-side types module. */
export const MLS_GROUP_ID_BYTES = 32;

/** Version byte that prefixes the canonical bytes the client signs when
 *  publishing a batch of KeyPackages. The proof binds the publish to the
 *  device + the exact bytes published, without requiring the server to
 *  parse the TLS-encoded MLS KeyPackage struct (ADR-015 §5 authenticity
 *  guarantee — implemented via existing UserDevice.ed25519Pub instead of a
 *  server-side MLS parser). Distinct from 0x01 in user.ts (device bundle). */
export const MLS_PUBLISH_PROOF_VERSION = 0x02;

// ── Base64 helpers ──────────────────────────────────────────────────────────
// We don't ship the Buffer/atob decode at this layer — schemas only validate
// the *envelope*. The router decodes on input; the engine on output. Keeps
// this file dependency-free aside from zod.

const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

/** Bounded opaque base64 — used for any blob whose decoded length the
 *  server doesn't fix. Lower bound is 1 byte (no empty strings). */
function b64Bounded(maxRawBytes: number, label: string) {
  // base64 encodes 3 raw bytes per 4 chars; ceil(maxRaw * 4/3) over-counts
  // padding by at most 2 chars, fine for the upper-bound check.
  const maxChars = Math.ceil((maxRawBytes * 4) / 3) + 4;
  return z
    .string()
    .min(1, `${label} required`)
    .max(maxChars, `${label} exceeds ${maxRawBytes}B raw cap`)
    .regex(BASE64_RE, `${label} must be base64`);
}

/** Exact-length base64 — used for fixed-width fields (GroupId, signatures). */
function b64Exact(rawBytes: number, label: string) {
  // Exact b64 char count for N raw bytes (with padding) = ceil(N/3)*4.
  const exact = Math.ceil(rawBytes / 3) * 4;
  return z
    .string()
    .length(exact, `${label} must be ${exact} base64 chars (${rawBytes}B raw)`)
    .regex(BASE64_RE, `${label} must be base64`);
}

// ── Primitive schemas ───────────────────────────────────────────────────────

/** 32-byte MLS GroupId, base64. */
export const GroupIdB64 = b64Exact(MLS_GROUP_ID_BYTES, "groupId");
export type GroupIdB64 = z.infer<typeof GroupIdB64>;

/** Non-negative MLS epoch counter. JS-safe range; OpenMLS uses u64
 *  internally but practical epoch counts are ≪ 2^53. */
export const Epoch = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export type Epoch = z.infer<typeof Epoch>;

/** 64-byte Ed25519 detached signature, base64. */
const Ed25519SigB64 = b64Exact(64, "sig");

/** Opaque TLS-encoded MLS KeyPackage public bytes. */
export const KeyPackageBytesB64 = b64Bounded(
  MLS_KEY_PACKAGE_MAX_BYTES,
  "keyPackage",
);
export type KeyPackageBytesB64 = z.infer<typeof KeyPackageBytesB64>;

/** Opaque TLS-encoded MLS Welcome bytes. */
export const WelcomeBytesB64 = b64Bounded(MLS_WELCOME_MAX_BYTES, "welcome");
export type WelcomeBytesB64 = z.infer<typeof WelcomeBytesB64>;

/** Opaque TLS-encoded MLS MlsMessageOut (Commit) bytes. */
export const CommitBytesB64 = b64Bounded(MLS_COMMIT_MAX_BYTES, "commit");
export type CommitBytesB64 = z.infer<typeof CommitBytesB64>;

// ── mls.keys.* ──────────────────────────────────────────────────────────────

/** Input to mls.keys.publish.
 *
 *  The `proofSigB64` is an Ed25519 signature by this device's `ed25519Pub`
 *  over the canonical bytes:
 *
 *    0x02 ‖ deviceId-utf8 ‖ sha256(concat(decoded keyPackages, in order))
 *
 *  Server side: decode the keyPackages base64, recompute the digest, verify
 *  the sig against UserDevice.ed25519Pub. Single Ed25519 verify per publish
 *  call regardless of batch size. See ADR-015 §5 for the rationale —
 *  authenticity gate without a server-side MLS parser.
 *
 *  Use `canonicalPublishProofBytes(...)` (below) to construct the digest
 *  input identically on both sides. */
export const PublishKeyPackagesInput = z.object({
  deviceId: z.string().uuid(),
  keyPackagesB64: z
    .array(KeyPackageBytesB64)
    .min(1, "must publish ≥1 keyPackage")
    .max(
      KEY_PACKAGE_PUBLISH_BATCH_MAX,
      `batch size exceeds ${KEY_PACKAGE_PUBLISH_BATCH_MAX}`,
    ),
  proofSigB64: Ed25519SigB64,
});
export type PublishKeyPackagesInput = z.infer<typeof PublishKeyPackagesInput>;

export const PublishKeyPackagesOutput = z.object({
  /** Number of new rows inserted by this call. */
  published: z.number().int().nonnegative(),
  /** Server's view of the post-insert total for this device. Caller uses
   *  this to decide whether to top up. */
  totalForDevice: z.number().int().nonnegative(),
});
export type PublishKeyPackagesOutput = z.infer<typeof PublishKeyPackagesOutput>;

/** Input to mls.keys.fetchForAccounts. Returns one KeyPackage per device
 *  for each listed account — the consume-on-fetch DELETE … RETURNING path. */
export const FetchKeyPackagesForAccountsInput = z.object({
  accountIds: z
    .array(z.string().cuid())
    .min(1)
    .max(FETCH_KEY_PACKAGES_ACCOUNTS_MAX),
});
export type FetchKeyPackagesForAccountsInput = z.infer<
  typeof FetchKeyPackagesForAccountsInput
>;

/** One KeyPackage bundle returned per device for the requested account.
 *  `ed25519PubB64` is the device's MLS BasicCredential signature key (same
 *  bytes as the M3 device key per ADR-015 §5) — the caller's MLS engine
 *  uses it to validate the KeyPackage's own signature before adding the
 *  device to the group. */
export const KeyPackageBundle = z.object({
  deviceId: z.string().uuid(),
  ed25519PubB64: b64Exact(32, "ed25519Pub"),
  keyPackageB64: KeyPackageBytesB64,
});
export type KeyPackageBundle = z.infer<typeof KeyPackageBundle>;

/** Map keyed by accountId. Missing devices (no fresh KeyPackage in pool)
 *  appear as omitted entries in the per-account array; an account with zero
 *  devices ready maps to `[]`. Caller handles top-up signalling. */
export const FetchKeyPackagesForAccountsOutput = z.record(
  z.string().cuid(),
  z.array(KeyPackageBundle),
);
export type FetchKeyPackagesForAccountsOutput = z.infer<
  typeof FetchKeyPackagesForAccountsOutput
>;

// ── mls.groups.* ────────────────────────────────────────────────────────────

/** Input to mls.groups.publishCommit. Server enforces the per-group epoch
 *  ordering via the `GroupCommit @@unique([groupId, epoch])` gate (ADR-015
 *  §6). On 23505 the caller fetches pending commits, applies, retries with
 *  `epoch+1`. The bytes are opaque — server stores as-is. */
export const PublishCommitInput = z.object({
  groupIdB64: GroupIdB64,
  epoch: Epoch,
  commitB64: CommitBytesB64,
});
export type PublishCommitInput = z.infer<typeof PublishCommitInput>;

/** Input to mls.groups.fetchPendingCommits. Returns commits with
 *  `epoch >= sinceEpoch` ordered ascending — the caller applies each in
 *  order, then resumes from `lastEpoch + 1` on the next poll. */
export const FetchPendingCommitsInput = z.object({
  groupIdB64: GroupIdB64,
  sinceEpoch: Epoch,
});
export type FetchPendingCommitsInput = z.infer<typeof FetchPendingCommitsInput>;

export const PendingCommit = z.object({
  epoch: Epoch,
  commitB64: CommitBytesB64,
});
export type PendingCommit = z.infer<typeof PendingCommit>;

export const FetchPendingCommitsOutput = z.object({
  commits: z.array(PendingCommit).max(FETCH_PENDING_COMMITS_PAGE_MAX),
});
export type FetchPendingCommitsOutput = z.infer<
  typeof FetchPendingCommitsOutput
>;

/** Input to mls.groups.publishWelcomes. After a successful publishCommit
 *  on an add_members op, the sender's `AddMembersResult.welcome` blob is
 *  routed to each new joiner. `recipientDeviceId` is set when the sender
 *  knows which device on the recipient account is being added (always the
 *  case for fetchKeyPackagesForAccounts callers — the KP came from that
 *  device). One row per recipient device. */
export const WelcomeRecipient = z.object({
  recipientAccountId: z.string().cuid(),
  /** Optional — when known, lets the consume-on-fetch path filter by device
   *  (the recipient's other devices won't see this Welcome). */
  recipientDeviceId: z.string().uuid().nullable().optional(),
  welcomeB64: WelcomeBytesB64,
});
export type WelcomeRecipient = z.infer<typeof WelcomeRecipient>;

export const PublishWelcomesInput = z.object({
  groupIdB64: GroupIdB64,
  recipients: z
    .array(WelcomeRecipient)
    .min(1, "must publish ≥1 welcome")
    .max(
      FETCH_KEY_PACKAGES_ACCOUNTS_MAX,
      `recipients exceeds ${FETCH_KEY_PACKAGES_ACCOUNTS_MAX}`,
    ),
});
export type PublishWelcomesInput = z.infer<typeof PublishWelcomesInput>;

export const PublishWelcomesOutput = z.object({
  delivered: z.number().int().nonnegative(),
});
export type PublishWelcomesOutput = z.infer<typeof PublishWelcomesOutput>;

/** Welcomes are addressed to the current account — no input filter beyond
 *  the page cap. Consume-on-fetch: returned rows are DELETEd in the same
 *  tx, so a Welcome is seen exactly once per account. */
export const PendingWelcome = z.object({
  id: z.string().cuid(),
  groupIdB64: GroupIdB64,
  welcomeB64: WelcomeBytesB64,
});
export type PendingWelcome = z.infer<typeof PendingWelcome>;

export const FetchPendingWelcomesOutput = z.object({
  welcomes: z.array(PendingWelcome).max(FETCH_PENDING_WELCOMES_PAGE_MAX),
});
export type FetchPendingWelcomesOutput = z.infer<
  typeof FetchPendingWelcomesOutput
>;

// ── Canonical bytes helpers ─────────────────────────────────────────────────
// Same bytes constructed on both sides so the Ed25519 sig verifies. No
// crypto here — caller hashes/signs/verifies with their preferred lib.

/** Concatenate the publish proof input bytes:
 *
 *    0x02 ‖ deviceId-utf8 ‖ sha256(concat(keyPackages, in publish order))
 *
 *  Returns the bytes-to-be-signed. Caller is responsible for the sha256
 *  step (Node `crypto.createHash` server-side; WebCrypto/JS impl on the
 *  RN side). Keeping the digest at the call site lets each platform use
 *  its native impl without us bundling a hash library here. */
export function canonicalPublishProofBytes(
  deviceId: string,
  keyPackagesDigest: Uint8Array,
): Uint8Array {
  if (keyPackagesDigest.length !== 32) {
    throw new RangeError(
      `keyPackagesDigest must be 32B sha256, got ${keyPackagesDigest.length}`,
    );
  }
  const idBytes = new TextEncoder().encode(deviceId);
  const out = new Uint8Array(1 + idBytes.length + keyPackagesDigest.length);
  out[0] = MLS_PUBLISH_PROOF_VERSION;
  out.set(idBytes, 1);
  out.set(keyPackagesDigest, 1 + idBytes.length);
  return out;
}
