# Sessions

For templating multiple on same machine:

1. sst.config.ts — name: 'sessions' needs to change per project
2. Bundle IDs — io.sessions.app in app.json + native files needs to change per
   project

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Mobile**: React Native (Expo) + Tamagui
- **Backend**: tRPC + Better Auth + Prisma (Neon HTTP driver adapter)
- **Database**: Neon (serverless PostgreSQL, accessed over HTTP — no VPC required)
- **Events**: AWS SNS + SQS (fan-out pattern)
- **Media**: Cloudflare R2 + CDN (zero egress)
- **Blockchain**: SUI — client-signed transactions live; on-chain indexer deferred until first NFT/escrow ships
- **Infrastructure**: SST v3 (Pulumi) → AWS Lambda + Cloudflare

## Run

### RN/Expo - (stdout doesnt work running from root with pnpm)

cd apps/mobile
pnpm prebuild-clean && npx expo run:android

### Server/API

pnpm api

```
cd apps
```

## 2 simulators for chat debugging:

Terminal 1: pnpm --filter @repo/api-server dev
Terminal 2: pnpm --filter @repo/chat-ws dev  
 Terminal 3: pnpm --filter mobile expo start # Metro — keep open
Terminal 4: xcrun simctl spawn <UDID-1> log
stream ... # sim 1 logs  
 Terminal 5: xcrun simctl spawn <UDID-2> log  
 stream ... # sim 2 logs  
 Terminal 6: scratchpad for `expo run:ios      
  --device <name>` when needed

## Prerequisites

- Node.js >= 18
- pnpm (`corepack use pnpm@latest`)
- Neon account (free) — https://neon.tech
- AWS account — SNS + SQS used for event bus (free tier: 1M requests/mo each)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create Neon database

- Sign up at https://neon.tech (free tier: 0.5GB)
- Create a project, copy the connection string

### 3. Create `.env` files

`packages/database/.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/sessions?sslmode=require"
```

`services/api/.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/sessions?sslmode=require"
BETTER_AUTH_SECRET="generate-a-random-32-char-string-here"
BETTER_AUTH_URL="http://localhost:3001"
TRUSTED_ORIGINS="http://localhost:3000,http://localhost:8081"
```

### 4. Run migrations and seed

```bash
pnpm --filter @repo/database db:migrate:dev
pnpm --filter @repo/database db:seed
```

### 5. Start API server

```bash
pnpm --filter @repo/api-server dev
```

Server runs at http://localhost:3001

- tRPC: http://localhost:3001/trpc
- Better Auth: http://localhost:3001/auth

### 6. Start mobile app

```bash
cd apps/mobile
npx expo start --dev-client
```

## Auth

Authentication is handled by **Better Auth** (email/password live). SUI wallet auth (SIWS) and zkLogin (Google/Apple → SUI address) are planned — implementation deferred until identity tier flows require an on-chain handle.

There is no external auth page. The mobile app has built-in sign-in/sign-up screens (`apps/mobile/app/(auth)/`) that call Better Auth's API directly.

To create an account locally, use the sign-up screen in the app or POST directly:

```bash
curl -X POST http://localhost:3001/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123","name":"Dev"}'
```

## Seed Data

The seed creates test accounts, profiles, posts, follows, comments, likes, and NFTs. Seed accounts have placeholder password hashes and **cannot be used to log in via Better Auth** — sign up fresh instead. The seed data is useful for testing feed rendering, profile views, and data relationships.

| Email             | Tier    | Profiles                               |
| ----------------- | ------- | -------------------------------------- |
| alice@example.com | ARTIST  | alice-music, alice-studio              |
| bob@example.com   | CREATOR | bob-beats, the-collective (owner)      |
| carol@example.com | CREATOR | carol-creates, the-collective (member) |
| dave@example.com  | BASIC   | fabric-london                          |
| eve@example.com   | BASIC   | warehouse-events                       |
| frank@example.com | NONE    | none (new user edge case)              |

## Database Commands

```bash
pnpm --filter @repo/database db:generate       # Regenerate Prisma client
pnpm --filter @repo/database db:migrate:dev    # Create/apply migrations
pnpm --filter @repo/database db:seed           # Seed test data
pnpm --filter @repo/database db:studio         # Open Prisma Studio
```

## RN Device Debugging

### Android — WiFi ADB (Android 11+)

1. Enable Developer Options → Wireless debugging
2. Tap "Pair device with pairing code" → note IP, port, code
3. `adb pair <ip>:<port>` → enter code
4. `adb connect <ip>:<port>`
5. `npx expo start --dev-client`

### iOS — Xcode Network Debugging

1. Cable device once → Xcode → Window → Devices & Simulators
2. Check "Connect via network" for the device
3. Unplug cable — stays paired over WiFi
4. `npx expo start --dev-client`

### Metro tunnel (cross-network fallback)

```bash
npx expo start --tunnel
```

Requires `@expo/ngrok`. Slower but works on any network.

## Architecture

The infrastructure is staged. Phase 1 is what runs today and carries the app from
zero to ~10k DAU on a near-zero monthly bill. Phase 2 layers the scale primitives
that become necessary somewhere between 10k and 1M DAU. We add Phase 2 components
only when concrete signals appear (see triggers below) — not preemptively.

### Phase 1 — Current (0 → ~10k DAU, ~$5-10/mo)

```
RN App ──► Lambda (API, public)            ──► Neon Postgres (HTTP driver)
       │                                   ──► SNS topics (event bus)
       │                                          ├─► SQS ModerationQueue   (consumer stub)
       │                                          └─► SQS NotificationQueue (consumer stub)
       │
       ├──► Lambda (Upload, public)        ──► Cloudflare R2 ──► Cloudflare CDN
       │
       └──► SUI RPC (direct, client-signed transactions)

Real-time:   Expo Push + client polling
WebSocket:   deferred (see infra/stacks/realtime.ts)
SUI indexer: deferred (see infra/stacks/sui-indexer.ts)
VPC:         deferred — provisioned only when ECS Fargate (indexer) ships
```

**Why no VPC.** Lambda reaches Neon over public HTTPS via the `@prisma/adapter-neon`
HTTP driver. Removing the VPC kills NAT gateway costs (~$32/mo prod, ~$3-5/mo dev)
and the 1-3s cold-start penalty Lambda pays when attached to a VPC. R2 is also
public-internet, so nothing else in the API tier needs private subnets either.

**Why no Redis.** Session lookups against Neon are fast over HTTP at this scale,
and SNS+SQS already covers async event flow. Redis pays off when DAU >5k or feed
read latency starts to hurt — neither yet true.

### Phase 2 — Scale (10k → 1M DAU)

Activate components individually when their trigger fires. Each is independent.

```
                              ┌─► Cloudflare Workers (read API, edge cache)
RN App ─► CF (DNS/WAF) ──────► │
                              └─► Lambda (write API)  ─► Neon (HTTP, +read replicas)
                                          │
                                          ├─► Upstash Redis (sessions, rate limit, feed cache)
                                          ├─► SNS / SQS  (event bus, unchanged)
                                          ├─► Search (Typesense / Meilisearch on Fargate)
                                          └─► OpenTelemetry → Axiom / Sentry

Cloudflare Durable Objects ──► WebSocket / chat / live auctions

ECS Fargate Spot (SUI Indexer) ─► SUI checkpoint stream ─► SNS chainEvent ─► DB
SUI Move contracts            ─► escrow / reputation / DAO governance

Timeline service (fan-out-on-write) ─► Redis lists per follower ─► hydrate from Postgres
```

| Phase 2 component                     | Trigger to add                             | Approx cost at 100k DAU                           |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Upstash Redis                         | session p50 >50ms or DAU >5k               | $5-30/mo                                          |
| SUI indexer (Fargate Spot)            | first NFT/escrow feature ships             | $3-5/mo                                           |
| Search (Typesense / Meilisearch)      | Postgres trigram exhausted                 | $19/mo (Cloud) or $5/mo (self-host)               |
| Observability (OTel + Sentry/Axiom)   | first paid user                            | free tier → $26/mo                                |
| Timeline fan-out                      | feed query p95 >300ms                      | Redis already paid                                |
| Cloudflare Workers (read tier)        | global DAU + p95 latency >250ms outside EU | $5/mo + 100k req/day free                         |
| Cloudflare Durable Objects            | live chat / auctions / streams ship        | $5/mo + per-DO usage                              |
| Tiered moderation (OSS → Rekognition) | image volume >10k/day                      | $5-50/mo Fargate, Rekognition only on uncertainty |
| Multi-region Neon read replicas       | non-EU DAU >20%                            | +$19/mo per replica                               |

How DO slots into your architecture

                                         ┌─────────────────────┐
     RN device  ─── HTTPS (tRPC) ──────► │  AWS Lambda (api)   │ ──► Neon

(Postgres)  
 │ │ Better Auth │  
 │ └──────────┬──────────┘  
 │ │ (msg persist + push  
 enqueue)  
 │ ▼  
 │ SNS / SQS ──► push-sender Lambda  
 ──► APNs/FCM  
 │  
 │ WSS ┌──────────────────────────────────────────────┐  
 └─────►│ Cloudflare Worker (chat-ws) │
│ route WS by chatId → DO instance │  
 │ │  
 │ ┌──────────────────────────────┐ │  
 │ │ Durable Object: Chat<chatId> │ │  
 │ │ - holds member WS sockets │ │  
 │ │ - in-memory broadcast │ │  
 │ │ - hibernates when idle │ │  
 │ │ - posts msg → Lambda /msg │ │  
 │ └──────────────────────────────┘ │  
 └──────────────────────────────────────────────┘  
 │  
 └─ R2 (media presigned URLs, already in stack)

#### Tradeoffs to be honest about

##### Against DO:

- New runtime (Workers ≠ Node) — TS works but no full Node API. For WS
  handling that's fine; you'd avoid heavy npm deps anyway.
- Two-cloud auth: bearer token from Better Auth needs to be verified at the
  edge. Two options:
  - (a) JWT — verify in Worker with shared secret. Fast, no round-trip.
  - (b) Opaque session — Worker calls Lambda /auth/verify on connection
    only (one-time cost per WS open, not per msg).
- DO 128MB RAM per object — chat with 200k members in single DO would
  crowd. Solution: shard mega-channels (Telegram-tier broadcast channels)
  across multiple DOs. Not Phase 1 problem.
- Vendor lock-in to CF for chat layer. (You already lock to CF for R2; same
  blast radius.)

Mitigation: chat-transport package abstracts the WS surface. Switching to
Fargate later if needed = swap server, keep client.

---

##### When to revisit

- If DAU > 100k and DO bill > $1k/mo, benchmark Fargate w/ uWebSockets.js.
  At that scale, ops cost of self-managed becomes worth it.
- If E2E push latency requires server-side fanout coordination beyond DO's
  128MB → shard or move to Fargate.

For 0 → 100k DAU window (next 18-24 months realistic), DO is right.

### Authentication

- **Better Auth** with DB-backed sessions (fully revocable)
- **Email/password**: sign up → creates AuthUser + domain Account (active)
- **SUI wallet (SIWS)**: challenge/response — implemented, deferred
- **zkLogin (Google/Apple → SUI address)**: planned — keyless on-chain identity for users without a wallet
- **Bearer tokens** for React Native (no cookies, stored in SecureStore)
- Session validated in tRPC context via `auth.api.getSession({ headers })`

### Key Design Decisions

- **Account ≠ Profile**: one account can own multiple profiles (musician, band, venue)
- **Identity tiers**: NONE → BASIC → CREATOR → ARTIST (gates features like NFT minting)
- **Event-driven**: SNS + SQS fan-out decouples services (moderation, notifications, indexing)
- **Media upload**: presigned URLs → client uploads direct to R2 → no Lambda in the read path
- **Neon over HTTP**: Prisma uses `@prisma/adapter-neon` with `poolQueryViaFetch`, so
  the API Lambda makes a regular `fetch()` to Neon — no VPC, no connection pool.
  The `linux-arm64` Prisma engine binary IS shipped in the bundle today (see
  ADR-002): loaded but unused — the Neon adapter handles queries. Bundle ~15MB
  heavier and adds ~200ms cold start. Engine-less mode (no binary) is planned via
  a Prisma Lambda layer; see ADR-002 for the migration trigger.

## Infrastructure

See [infra/README.md](infra/README.md) for deployment, secrets, cost estimates, and provider details.

## EAS (Expo Application Services)

Free commands: `eas update`, `eas credentials`, `eas device:*`, `eas secret:*`, `eas submit --latest`

Costs 1 credit: `eas build` (any platform). Use `npx expo run:android` for local builds.

OTA updates (free, instant, no App Store review):

```bash
eas update --branch development --message "fix feed"
```

Only rebuild when adding packages with native code.

---

## Chat MVP — Build Plan (M0 → M8)

End-to-end encrypted, multi-device chat as the first major feature module. Telegram-tier scope: ~80% feature parity for MVP (no public channels, no bots platform). Designed for 0 → 1M+ DAU on the existing AWS Lambda + Neon + R2 stack, with Cloudflare Durable Objects added as the WebSocket layer.

### Confirmed architectural decisions

| Decision                             | Choice                                                                                                             | Rationale                                                                                                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native module location               | `packages/chat-*` (workspace) for reusable native code; `apps/mobile/modules/` for app-only glue (NSE, CallKit)    | Matches existing `@repo/*` namespace; reusable bits are isolated, app-coupled bits stay in the app shell                                                                                                                                          |
| WebSocket transport                  | Cloudflare Durable Objects (one DO per chat)                                                                       | Hibernation API → idle WS connections cost $0; edge latency 30-50ms; no VPC needed; linear cost scaling; complements R2 (already CF)                                                                                                              |
| MVP crypto                           | libsodium box (1:1 only); group chat = server-trust until M3.5                                                     | Ship working chat fast; upgrade to MLS (RFC 9420) before public-launch privacy claims                                                                                                                                                             |
| Production crypto (M3.5, pre-launch) | **OpenMLS 0.8.1** (Rust, MIT) via **UniFFI** Swift + Kotlin bindings — RFC 9420 group-native E2EE for 1:1 + groups | Zero licence cost forever (MIT, no AGPL exposure); group-native = O(1) ciphertext per send + O(log N) re-key; production-validated by Discord DAVE (200M+ users) and Mozilla Firefox UniFFI. See ADR-015 for licence audit + libsignal rejection. |
| Push notifications                   | FCM (Android) + APNs (iOS) direct, no Expo Push relay                                                              | E2E requires that the relay never sees plaintext; Expo Push relay would break that property                                                                                                                                                       |
| Local database                       | `op-sqlite` with SQLCipher; key in `expo-secure-store`                                                             | SQLCipher is the established encrypted-SQLite path; op-sqlite gives best RN perf and JSI bindings                                                                                                                                                 |
| Native modules approach              | Expo Modules API; scaffold via `pnpm create expo-module packages/<name> --no-example`                              | Autolinking + monorepo dedup works out of the box on SDK 54+                                                                                                                                                                                      |
| Server-side persistence              | Existing AWS Lambda (tRPC) writes to Neon; DO is transport + transient state only                                  | Source of truth stays in Postgres; if DO restarts, history is intact                                                                                                                                                                              |

### Crypto invariants (apply to every milestone M3 → M8)

1. **Servers never hold plaintext.** Lambda, DO, R2 see ciphertext + opaque metadata only. Push relays (APNs/FCM) get ciphertext bodies.
2. **Servers never hold private keys.** All private key material lives in the device's secure enclave / Keychain / Keystore. Recovery flows (if ever added) use user-held mnemonic, not server escrow.
3. **Server-side validators are cheap and content-blind.** Workers/Lambda enforce byte-length and signature shape on crypto envelopes; they never attempt to parse plaintext.
4. **Zero new infra services for crypto.** All crypto state (pubkey directory, prekey bundles in M3.5) reuses Postgres + existing tRPC Lambda. CDN/CF KV mirrors are added only on scale triggers (≥100k DAU), not for correctness.
5. **Forward-compat with the next milestone.** Every crypto frame carries a `v` version byte so M3 → M3.5 upgrade can negotiate per-chat without breaking history.

### Package layout

```
packages/
  chat/                  TS only — UI components, hooks, screens, store
  chat-transport/        TS only — WebSocket client, msgpack codec, reconnect
  chat-db/               native — op-sqlite + SQLCipher wrapper
  chat-crypto/           native — libsodium primitives + OpenMLS engine (M3.5+)
  chat-mls-core/         native (Rust) — OpenMLS + UniFFI; produces XCFramework + AAR
  chat-calls/            native — react-native-webrtc wrapper (M7)

apps/mobile/modules/
  notification-service/  iOS NSE — Swift, decrypts push payload outside JS runtime
  callkit-bridge/        CallKit + ConnectionService wiring (M7)

services/
  chat-ws/               Cloudflare Worker + Durable Objects (chat fanout)
```

### Milestones

Estimates assume one engineer, full focus, time for debugging native modules properly. Each milestone produces a shippable increment — chat is usable after M4, secure after M3.5, complete after M8.

#### M0 — Scaffold (1 week)

- Create the five `packages/chat-*` packages with `pnpm create expo-module ... --no-example`.
- Wire `"@repo/chat-*": "workspace:*"` into `apps/mobile/package.json`.
- Verify `pnpm rn:prebuild-clean` succeeds on iOS and Android with the new native modules autolinked.
- Confirm `experiments.autolinkingModuleResolution: true` dedupes correctly.
- CI: typecheck + lint + (placeholder) test runs across the new packages.
- Acceptance: a `console.log` from `@repo/chat-crypto`'s native module appears in app logs on both platforms.

#### M1 — WebSocket transport on Cloudflare Durable Objects (2-3 weeks)

Server-side (`services/chat-ws`):

- New SST stack adding the Cloudflare Worker + Durable Object binding.
- One DO class per chat (`Chat<chatId>`) that holds connected WS sockets, broadcasts in-memory, and POSTs to the existing Lambda API for persistence.
- Better Auth bearer verification at the edge (JWT-shaped, shared secret with the API).
- WS Hibernation API enabled so idle DOs cost nothing.

Client-side (`@repo/chat-transport`):

- WS client with exponential-backoff reconnect, heartbeat, msgpack codec.
- Per-user inbound/outbound channels; offline send-queue.
- Lifecycle: open on app foreground, close on background, restore on resume.

Integration:

- Wire the transport into `apps/mobile` providers; store connection state in Zustand.
- Acceptance: server emits a `hello` frame on WS open and `{t:"ping"}` round-trips to `{t:"pong"}` (msgpack-encoded); survives airplane-mode toggle and app backgrounding/foregrounding without dropping queued sends.

#### M2 — Local encrypted database (1-2 weeks)

- `@repo/chat-db` exposes typed schema: `chats`, `messages`, `members`, `sync_cursor`, `pending_outbox`, `key_material`.
- SQLCipher passphrase generated on first launch, persisted in `expo-secure-store` (Keychain / Keystore) under a shared keychain group (so the iOS NSE can read it later).
- Forward-only migration runner.
- Outbox pattern for sends: every outbound message is written to `pending_outbox` first, marked sent on server ack, retransmitted on reconnect.
- Acceptance: kill the app mid-send; on reopen the message is still in the outbox and is retransmitted exactly once.

#### M3 — MVP crypto with libsodium (2 weeks)

- `@repo/chat-crypto` native module wrapping libsodium via **Swift-Sodium (iOS)** + **lazysodium-android (Android)**.
- Surface: `generateIdentity()`, `box(plain, theirPub, mySecret)`, `boxOpen(...)`, `randomNonce()`, `signKeyBundle(...)`. All sync, `Uint8Array` in/out.
- Single 32-byte seed per device → derive Ed25519 (identity/sign) + X25519 (encrypt). Forward-compat with M3.5 MLS BasicCredential (same Ed25519 key signs the credential).
- Seed persisted in shared Keychain group `io.sessions.chat` set up in M2 (alias `chat-identity-seed-v1`, `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`).
- **Multi-device per user**: Postgres table `UserDevice(userId, deviceId, ed25519Pub, x25519Pub, addedAt)`. Outbound send = fanout-encrypt to every device of every recipient. Cheap at our scale (Postgres column read), Signal-shaped.
- Pubkey directory = tRPC routes `user.keys.publish` / `user.keys.byUserIds(batch)`. Better Auth bearer–authed. Client caches peer pubkeys in `chat-db.peer_keys` table (TTL 24h).
- Per-message random 24-byte XSalsa20 nonce. Plaintext frame `{v: 1, text, ts}` msgpack-encoded then boxed.
- 1:1 only for now; group sends carry explicit `unencrypted: true` envelope flag and a UI banner ("Not encrypted — upgrading soon") until M3.5.
- Server-side validators: DO/Worker rejects `len(nonce) != 24` or `len(ciphertext) < 17`.
- Acceptance: two devices DM each other; server logs and database show only ciphertext; manual decrypt with the wrong key fails; multi-device fanout works (same user logged in on 2 devices both receive their copy).

#: 1  
 Chunk: Native binding — Swift-Sodium pod +  
 lazysodium gradle, replace hello() stub with  
 generateIdentity / box / boxOpen / randomNonce /
signKeyBundle  
 Why first: Biggest risk = native build config on  
 both platforms. Fail fast. Smoke test =
round-trip  
 in chat-db-debug screen.
Est: 3–4 days  
 ────────────────────────────────────────  
 #: 2  
 Chunk: Identity lifecycle — seed gen + keychain
group write + derive Ed25519/X25519 on read  
 Why first: Trivial once #1 lands. Unlocks
everything  
 downstream.  
 Est: 0.5 day
────────────────────────────────────────
#: 3  
 Chunk: Prisma schema + UserDevice table + migration
Why first: Server-side prerequisite. Can run in  
 parallel with #1 if I split.
Est: 0.5 day  
 ────────────────────────────────────────  
 #: 4  
 Chunk: tRPC user.keys.publish / user.keys.byUserIds

    + Better Auth bearer wiring

Why first: Tied to #3.  
 Est: 1 day  
 ────────────────────────────────────────
#: 5  
 Chunk: chat-db peer_keys table + cache layer
Why first: Client side of directory.  
 Est: 0.5 day
────────────────────────────────────────
#: 6  
 Chunk: Crypto pipeline
(packages/chat/src/crypto-pipe.ts) + plaintext  
 frame {v:1,text,ts} + outbound/inbound wrap
around  
 chat-transport  
 Why first: The bit that actually encrypts.
Est: 1.5 days
────────────────────────────────────────
#: 7
Chunk: DO/Worker validators (len(nonce)==24,
len(ciphertext)>=17, group unencrypted:true flag)
Why first: Defensive, server-side.
Est: 0.5 day
────────────────────────────────────────
#: 8
Chunk: Acceptance harness — extend chat-db-debug:
local fingerprint, peer fingerprint, last cipher
hex, wrong-key decrypt button. Two-device manual
verify.
Why first: Locks in acceptance criteria.
Est: 0.5 day

##### Cost + scale model (M3, additive over Phase 1 baseline)

| DAU         | Pubkey reads/sec | Pubkey storage | Additive cost | Path                                                                                                      |
| ----------- | ---------------- | -------------- | ------------- | --------------------------------------------------------------------------------------------------------- |
| 0–100       | <1               | ~20 KB         | **$0/mo**     | Neon free tier column, AWS Lambda free tier, on-device privkey, no new infra service.                     |
| 5k (Ph2 in) | ~50              | ~500 KB        | $0/mo         | Still Neon HTTP + tRPC Lambda; client cache absorbs reads.                                                |
| 100k        | ~1k (mostly hit) | ~10 MB         | ~$1/mo        | Add CF KV mirror of pubkeys (write-through on publish). Fits the Phase 2 trigger row already in README.   |
| 1M          | ~10k (cached)    | ~100 MB        | ~$5–10/mo     | CF KV becomes primary read path; Postgres = source of truth. Pubkey publish stays on the slower API path. |

Privkey ops are 100% client-side at every scale — server cost from private-key handling = $0 forever.

#### M3.5 — MLS (RFC 9420) upgrade via OpenMLS (3 weeks, before public launch)

Group-native end-to-end encryption replacing the M3 libsodium box. See ADR-015 for the licence audit that drove the libsignal → OpenMLS swap. Zero AGPL exposure; MIT dependency chain.

**Stack**

- `openmls` 0.8.1 + `openmls_rust_crypto` 0.5.1 + `openmls_traits` 0.5.0 — all MIT.
- `uniffi` 0.31.1 (MPL-2.0, file-scoped) generates Swift + Kotlin from one Rust source.
- New package `packages/chat-mls-core` (Rust) — produces `chat_mls.xcframework` (iOS) + `chat-mls.aar` (Android) via `packages/chat-mls-core/scripts/build-mls.sh`. Single bump point. Same toolchain prerequisites as the M3 sodium build (rustup + protobuf + per-platform targets) — `uniffi-bindgen` replaces `cbindgen`.
- Ciphersuite: `MLS_128_DHKEMX25519_AES128GCM_SHA256_Ed25519` (RFC 9420 mandatory). PQ ciphersuite added via MLS extension when IETF stabilises — Phase 1 ships classical-only.

**Architecture**

- Group-native: one ciphertext per send regardless of group size; server fans server-side via the existing SNS+SQS path. O(1) bandwidth per send vs M3's O(N) per-device fanout.
- Authentication Service = Better Auth + `UserDevice` table. `BasicCredential` carries `accountId` bytes signed by the M3 Ed25519 key already in `user.keys`. Server validates signature key match at `publishKeyPackages`. No new PKI infra.
- Delivery Service = existing Lambda + Neon. `GroupCommit @@unique([groupId, epoch])` enforces causal ordering; concurrent commit racers retry with `epoch+1` after fetching the winner.
- Group state lives in a libsodium-AEAD-wrapped SQLite file outside the M2 chat-db (same isolation pattern previously planned for the libsignal store).
- `mls_group_id BLOB(32)` column on `Chat` row (server + local). Chats outlive groups: split / leave / rejoin can recreate the group under same `chatId` with a fresh `mlsGroupId`.

**Server surface**

- `mls-keys` router: `publishKeyPackages(deviceId, packages[])`, `fetchKeyPackagesForAccounts(accountIds[])`. Atomic consume in one tx — replaces the M3 `user.keys.byUserIds` directory for v=2 sends.
- `mls-groups` router: `sendCommit(groupId, commitBytes, welcomesByAccountId)`, `fetchPendingCommits(groupId, sinceEpoch)`. Server distributes Welcome messages to new members; Commits broadcast to current members via SNS+SQS.
- Prisma: `KeyPackage` (one row = one consumable package) + `GroupCommit` (epoch-ordered log). Drops the libsignal-era `PreKeyBundle` + `OneTimePrekey` tables.

**Identity migration**

- Reuses the Ed25519 identity key generated in M3 as the MLS credential signature key — no fresh keygen, no UX-visible migration.
- Pre-launch posture: no live v=2 ciphertext to migrate. v=1 libsodium chats either re-key into a new MLS group on first v=2 send, or stay on v=1 for 1:1 fallback (decided per-chat via `chat_versions` sticky state).

**Forward secrecy + recovery**

- MLS provides forward secrecy + post-compromise security via tree-ratcheted epochs. Member-add re-key cost is O(log N) (vs Sender Keys O(N)).
- KeyPackage pool: 100 per device, top-up at threshold 20. Last-resort KeyPackage (replayable) skipped in Phase 1 — revisit when telemetry shows > 1% sessions hitting empty pool.
- Commit retention: keep all per group; MLS Resync at 500-commit threshold (Phase 2). Phase 1 ceiling ≈ 1 MB per group.
- Recovery threat model unchanged from M3: lose phone / uninstall = lose identity. PIN-based recovery + key escrow remain out of scope.

**Acceptance**

- 2-device DM via MLS group; 5-device group with one ciphertext decrypted by all; member add / remove mid-conversation; KeyPackage exhaustion behaviour; multi-account swap on same install; offline catch-up (kill app, send N msgs from peers, relaunch, decrypt all). Acceptance harness extends `chat-db-debug` (current KeyPackage count, group epoch, ratchet tree hash).

#### M4 — Chat UI: 1:1 + group text (3 weeks)

- `@repo/chat` exports `<ChatList />`, `<ChatScreen chatId>`, `useChats()`, `useMessages(chatId)`, `useSendMessage()`.
- FlashList for both chat list and message thread.
- Reanimated for scroll, gesture-handler for swipe-reply, smooth keyboard handling.
- Zustand store reads from `chat-db`, subscribes to `chat-transport` for live updates, writes to outbox on send.
- Routes added: `apps/mobile/app/(chat)/index.tsx` (list), `apps/mobile/app/(chat)/[chatId].tsx` (thread).
- Optimistic send with sent / delivered / read indicators (read receipts opt-in).
- Acceptance: two devices, real-time text, history scroll smooth at 60fps, optimistic sends visible immediately, eventual ack overwrites the optimistic state cleanly.

#### M5 — Media: images, voice, video, files (2-3 weeks)

- Voice: `expo-audio` record → encrypt → R2 presigned upload → playback on recipient. Waveform UI.
- Images: `expo-image-picker` → `react-native-compressor` → encrypt → R2 → `expo-image` cached display.
- Video: record / pick → transcode (defer heavy transcode to server-side or accept device-native compression for MVP) → encrypt → R2.
- Documents: `expo-document-picker` → encrypt → R2.
- Reuse existing `services/upload` SST stack for presigning. Content key transmitted in-band as an MLS application message (one envelope per send, server fans to all group members) — separate from the R2 object key, which stays opaque on the storage path. Bandwidth win at group scale vs the per-recipient libsodium wrap that was originally spec'd.
- Acceptance: 5MB image arrives end-to-end < 2s on wifi; voice msg playback starts within 200ms of tap; corrupted ciphertext fails closed (no plaintext leak).

#### M6 — Push notifications with E2E decryption (2 weeks)

- `expo-notifications` for token registration; tokens stored on the API and tied to the device session.
- iOS Notification Service Extension in `apps/mobile/modules/notification-service/` (Swift). Runs outside the JS runtime; reads the identity seed written in M3 from the shared Keychain group `io.sessions.chat` (set up in M2, populated in M3) — no re-prompt, no JS bridge. Decrypts the payload and presents the plaintext notification.
- Android: data-only FCM messages handled in a foreground/background Kotlin service; same decrypt-then-display flow.
- **MLS group-state for NSE.** v=2 messages ride MLS application messages keyed by current group epoch. The main app writes a sealed read-only snapshot of `(groupId → epoch, secrets)` to the shared keychain group on every Commit it processes; the NSE reads but never mutates this snapshot (mutating would race the main app's commit processing). Stale-snapshot fallback: a push arriving on an epoch the snapshot doesn't have falls through to a generic "New message — open app" notification (no plaintext, no race). Acceptable miss rate at Phase 1; revisit with a coordinated commit-applier if it becomes user-visible.
- Server (`services/api`): on a new message, looks up registered devices for offline members and dispatches ciphertext + minimal metadata via FCM/APNs (no plaintext).
- Acceptance: device locked, push arrives, plaintext notification appears with sender name and message body; opening the app shows the message already decrypted in local DB.

#### M7 — Voice and video calls (3-4 weeks)

- `react-native-webrtc` added as a config plugin; rebuild required.
- DTLS-SRTP fingerprint is signed by the Ed25519 identity key generated in M3 — same long-term identity ties together chat, push decryption, and call peer auth.
- `react-native-callkeep` for CallKit (iOS) and ConnectionService (Android) — proper system call UI, lock-screen ringing.
- Signaling over the existing chat-ws DO channel (no new transport).
- STUN free (Google or CF), TURN via Cloudflare Calls or self-hosted coturn — decide based on cost vs control trade-off when this milestone starts.
- `@repo/chat-calls` exports `startCall(chatId)`, `acceptCall(callId)`, `endCall(callId)`; manages peer connection lifecycle.
- 1:1 only; group calls explicitly out of scope (would need an SFU like LiveKit or mediasoup — separate post-MVP roadmap item).
- Acceptance: ring on locked screen, answer from CallKit UI, sub-300ms audio latency on wifi, clean teardown when either side hangs up or loses connection.

#### M7.5 - basica AI search for gigs locally:

Build a small AI feature into it — even a basic LLM-powered search or recommendation adds a genuine line to your CV and makes the project pull double duty.

#### M8 — Polish (3-4 weeks, ongoing post-launch)

- Animated stickers via Lottie (`lottie-react-native`); sticker pack management.
- Reactions, replies, threads.
- Message edits (with edit history surfaced) and deletes (soft delete; tombstone fanout via DO).
- Typing indicators and read receipts (over the existing DO channel; respect privacy toggle).
- Full-text search via SQLite FTS5, indexed on insert.
- Multi-device session list UI (Better Auth already tracks sessions; build the management screen).

### Total realistic timeline

~22-28 weeks (~5-7 months) for one engineer end-to-end, including M3.5. Excludes group calls, public channels, and bots — those are separate post-MVP roadmap items.

### Critical-path risks

1. **iOS NSE + E2E key sharing**: shared Keychain group entitlements and provisioning profile gymnastics; cert pinning. Budget extra days.
2. **WebRTC config plugin**: first prebuild after adding `react-native-webrtc` often breaks; test on a bare device early in M0 by adding a no-op config plugin.
3. **OpenMLS native build + UniFFI binding stability**: verify XCFramework + AAR reproducible in CI; pin `openmls` 0.8.x + `uniffi` 0.31.x. Mozilla actively maintains UniFFI (ships in Firefox mobile); OpenMLS 0.8.x is current stable. Bump policy lives in `packages/chat-mls-core/scripts/README.md`.
4. **DO connection budgeting at scale**: a single DO holds WS sockets in 128MB RAM; plan sharding for any future broadcast-style channels (>10k members).
5. **SQLCipher binary size**: adds ~3MB; acceptable but tracked.

#### Wranger Logs

First, log in:  
 pnpm --filter @repo/chat-ws exec wrangler login  
 Opens browser → authorize → returns.

Then tail:  
 pnpm --filter @repo/chat-ws exec wrangler tail  
 sessions-dev-chatwsscript-wwtawvxu --format pretty

Run smoke in another terminal, watch logs.

### Deep-link from Android emulator

App scheme is sessions (from app.json:scheme),  
 bundle io.sessions.app.

adb shell am start -W -a android.intent.action.VIEW
\
 -d "sessions://chat-db-debug" io.sessions.app

### iOS sim equivalent:

xcrun simctl terminate booted io.sessions.app
xcrun simctl openurl booted
sessions://chat-db-debug

### Native Rust libs for native wiring and corresponding toolchains

Both iOS and Android vendor OpenMLS artifacts produced by
`packages/chat-mls-core/scripts/build-mls.sh` (Rust → UniFFI → Swift + Kotlin
bindings → XCFramework + AAR). Full prereq list and per-platform notes live in
`packages/chat-mls-core/scripts/README.md`. See ADR-015 for licence chain
(MIT `openmls` + MPL-2.0 file-scoped `uniffi`).

```bash
# Common
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
brew install protobuf
cargo install uniffi-bindgen --version 0.31.1

# iOS
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

# Android
brew install --cask temurin@17
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
# NDK install via Android Studio → SDK Manager → set ANDROID_NDK_ROOT

# Build + vendor
pnpm --filter @repo/chat-mls-core exec ./scripts/build-mls.sh android
pnpm --filter @repo/chat-mls-core exec ./scripts/build-mls.sh ios
pnpm rn:rebuild-ios   # from repo root — runs prebuild-clean + run:ios
```
