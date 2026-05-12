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

| Decision                             | Choice                                                                                                          | Rationale                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Native module location               | `packages/chat-*` (workspace) for reusable native code; `apps/mobile/modules/` for app-only glue (NSE, CallKit) | Matches existing `@repo/*` namespace; reusable bits are isolated, app-coupled bits stay in the app shell                             |
| WebSocket transport                  | Cloudflare Durable Objects (one DO per chat)                                                                    | Hibernation API → idle WS connections cost $0; edge latency 30-50ms; no VPC needed; linear cost scaling; complements R2 (already CF) |
| MVP crypto                           | libsodium box (1:1 only); group chat = server-trust until M3.5                                                  | Ship working chat fast; upgrade to Signal Protocol before public-launch privacy claims                                               |
| Production crypto (M3.5, pre-launch) | Signal Protocol — double-ratchet for 1:1, Sender Keys for groups                                                | Forward secrecy + post-compromise security; gold standard                                                                            |
| Push notifications                   | FCM (Android) + APNs (iOS) direct, no Expo Push relay                                                           | E2E requires that the relay never sees plaintext; Expo Push relay would break that property                                          |
| Local database                       | `op-sqlite` with SQLCipher; key in `expo-secure-store`                                                          | SQLCipher is the established encrypted-SQLite path; op-sqlite gives best RN perf and JSI bindings                                    |
| Native modules approach              | Expo Modules API; scaffold via `pnpm create expo-module packages/<name> --no-example`                           | Autolinking + monorepo dedup works out of the box on SDK 54+                                                                         |
| Server-side persistence              | Existing AWS Lambda (tRPC) writes to Neon; DO is transport + transient state only                               | Source of truth stays in Postgres; if DO restarts, history is intact                                                                 |

### Package layout

```
packages/
  chat/                  TS only — UI components, hooks, screens, store
  chat-transport/        TS only — WebSocket client, msgpack codec, reconnect
  chat-db/               native — op-sqlite + SQLCipher wrapper
  chat-crypto/           native — libsodium (MVP) → Signal Protocol (M3.5)
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

- `@repo/chat-crypto` native module wrapping libsodium (Swift + Kotlin).
- Surface: `generateIdentity()`, `box(plain, theirPub, mySecret)`, `boxOpen(...)`, `randomNonce()`.
- Identity keypair generated on first launch; public key registered with the API; private key in shared keychain.
- Per-message AEAD nonce; ciphertext is what crosses the wire and what the server stores.
- 1:1 only for now; group chat is documented as server-trust until M3.5.
- Acceptance: two devices DM each other; server logs and database show only ciphertext; manual decrypt with the wrong key fails.

#### M3.5 — Signal Protocol upgrade (3-4 weeks, before public launch)

- Replace libsodium box with Signal's double-ratchet for 1:1 chats: forward secrecy + post-compromise security.
- Add Sender Keys protocol for group chats so groups are E2E too.
- X3DH-style prekey exchange via the API; prekey bundles uploaded on registration and topped up periodically.
- Either port `libsignal-protocol-c` into a custom Expo module, or build a thin native wrapper around an existing maintained Swift/Kotlin port — decide after M3 based on what's actively maintained at the time.
- Migration path for accounts already on libsodium: re-key on next login, archive old ciphertext as not-recoverable, surface a UI explanation.
- Acceptance: Signal-protocol-compliant message exchange verified against a known-good test vector; old keys revoked end-to-end; recovery flow documented.

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
- Reuse existing `services/upload` SST stack for presigning; add E2E content-key envelope (file key encrypted to recipient's pub key, separate from R2 object key).
- Acceptance: 5MB image arrives end-to-end < 2s on wifi; voice msg playback starts within 200ms of tap; corrupted ciphertext fails closed (no plaintext leak).

#### M6 — Push notifications with E2E decryption (2 weeks)

- `expo-notifications` for token registration; tokens stored on the API and tied to the device session.
- iOS Notification Service Extension in `apps/mobile/modules/notification-service/` (Swift). Runs outside the JS runtime; reads the user's private key from the shared Keychain group set up in M2; decrypts the payload; presents the plaintext notification.
- Android: data-only FCM messages handled in a foreground/background Kotlin service; same decrypt-then-display flow.
- Server (`services/api`): on a new message, looks up registered devices for offline members and dispatches ciphertext + minimal metadata via FCM/APNs (no plaintext).
- Acceptance: device locked, push arrives, plaintext notification appears with sender name and message body; opening the app shows the message already decrypted in local DB.

#### M7 — Voice and video calls (3-4 weeks)

- `react-native-webrtc` added as a config plugin; rebuild required.
- `react-native-callkeep` for CallKit (iOS) and ConnectionService (Android) — proper system call UI, lock-screen ringing.
- Signaling over the existing chat-ws DO channel (no new transport).
- STUN free (Google or CF), TURN via Cloudflare Calls or self-hosted coturn — decide based on cost vs control trade-off when this milestone starts.
- `@repo/chat-calls` exports `startCall(chatId)`, `acceptCall(callId)`, `endCall(callId)`; manages peer connection lifecycle.
- 1:1 only; group calls explicitly out of scope (would need an SFU like LiveKit or mediasoup — separate post-MVP roadmap item).
- Acceptance: ring on locked screen, answer from CallKit UI, sub-300ms audio latency on wifi, clean teardown when either side hangs up or loses connection.

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
3. **Signal Protocol port maintenance**: confirm during M3 which Swift/Kotlin port is actively maintained before committing in M3.5.
4. **DO connection budgeting at scale**: a single DO holds WS sockets in 128MB RAM; plan sharding for any future broadcast-style channels (>10k members).
5. **SQLCipher binary size**: adds ~3MB; acceptable but tracked.
