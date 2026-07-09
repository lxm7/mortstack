# Mortstack

[![CI](https://github.com/lxm7/mortstack/actions/workflows/ci.yml/badge.svg)](https://github.com/lxm7/mortstack/actions/workflows/ci.yml)

**End-to-end encrypted group chat on a near-zero-cost serverless stack**, built on
top of a social platform (profiles, posts, follows). The chat layer is the hero:
real group E2EE via **OpenMLS (RFC 9420)**, a **Cloudflare Durable Object**
realtime transport, and a **content-blind push pipeline** where the server never
sees plaintext.

# Dummy users:

| Email             | Tier    | Profiles                               |
| ----------------- | ------- | -------------------------------------- |
| alice@example.com | ARTIST  | alice-music, alice-studio              |
| bob@example.com   | CREATOR | bob-beats, the-collective (owner)      |
| carol@example.com | CREATOR | carol-creates, the-collective (member) |
| dave@example.com  | BASIC   | fabric-london                          |
| eve@example.com   | BASIC   | warehouse-events                       |
| frank@example.com | NONE    | none (new user edge case)              |

---

The infrastructure is deliberately staged (see [Scaling phases](#scaling-phases)):
what runs today carries the app from zero to ~10k DAU on roughly \$5–10/mo, and
the scale primitives are documented with the concrete signal that triggers each.

---

## What's implemented

**Chat (the differentiator)**

- **Group-native E2EE** — OpenMLS / RFC 9420 TreeKEM, a Rust core (`engine.rs`,
  ~1.1k lines) exposed to React Native through UniFFI. 1:1 and group chats share
  one crypto path.
- **Realtime transport** — a Cloudflare Worker fronting two Durable Object
  classes: `UserInbox` (one per user, holds device sockets) and `Chat` (one per
  chat, owns fanout + ordering). WebSocket Hibernation → idle sockets cost ~\$0.
- **Direct persist** — the `Chat` DO writes message batches straight to Neon over
  HTTP, no Lambda hop, with a DO-assigned monotonic `serverSerial` for total ordering
- **Content-blind push** — offline recipients get APNs/FCM via SNS → SQS →
  `chat-push` Lambda; only ciphertext crosses the bus, the device NSE decrypts.
- **Encrypted local store** — op-sqlite + SQLCipher on device; keys in the secure
  enclave via `expo-secure-store`.

**Social platform (the base)**

- Email/password auth (Better Auth), profiles + membership/roles, posts, comments,
  likes, follows, blocklists, reports, account deletion (GDPR erasure).
- Media uploads to Cloudflare R2 (zero egress) via presigned URLs + CDN read path.
- Event bus (SNS + SQS fan-out) for media/activity; moderation + social-push
  consumers are wired as stubs, activated per trigger.

---

## Architecture

### System overview

```mermaid
flowchart LR
  subgraph Client["Mobile — Expo / React Native (Tamagui)"]
    UI["Chat + Social UI"]
    MLSC["OpenMLS core<br/>Rust + UniFFI"]
    LSQL["Encrypted SQLite<br/>op-sqlite + SQLCipher"]
    NSE["Push decrypt<br/>iOS NSE / Android"]
  end

  subgraph CF["Cloudflare"]
    W["chat-ws Worker"]
    INBOX["UserInbox DO<br/>per user"]
    CHAT["Chat DO<br/>per chat"]
    R2["R2 media<br/>zero egress"]
    CDN["CDN"]
  end

  subgraph AWS["AWS — eu-west-1"]
    API["API Lambda<br/>tRPC + Better Auth + Prisma"]
    UP["Upload Lambda<br/>R2 presign"]
    SNS["SNS topics"]
    SQS["SQS queues"]
    PUSH["chat-push Lambda"]
  end

  NEON[("Neon Postgres<br/>HTTP driver · no VPC")]
  APNS["APNs / FCM"]

  UI -->|"tRPC / HTTPS"| API
  UI -->|"WSS · msgpack"| W
  W --> INBOX --> CHAT
  API -->|"Prisma over HTTP"| NEON
  CHAT -->|"batch persist · HTTP"| NEON
  CHAT -->|"SNS ChatDelivered"| SNS
  SNS --> SQS --> PUSH --> APNS
  APNS -->|"ciphertext payload"| NSE
  NSE --> MLSC --> LSQL
  UI --> UP --> R2 --> CDN
  API -->|"/internal/notify wake-up"| W
```

### Message send path

`Chat` and `UserInbox` are Durable Objects addressed deterministically by
`idFromName(chatId | userId)`, so every device and message routes to the same
instance without a lookup table.

```mermaid
sequenceDiagram
  participant A as Sender device
  participant IA as UserInbox sender
  participant C as Chat chatId
  participant N as Neon
  participant IB as UserInbox recipient
  participant B as Recipient device

  A->>IA: send · MLS ciphertext (msgpack)
  IA->>C: RPC forward
  Note over C: buffer ~100ms<br/>assign monotonic serverSerial
  C->>N: batch INSERT over HTTP
  C-->>IA: ack (serverSerial)
  IA-->>A: ack
  C->>IB: msg (ciphertext)
  IB-->>B: WS deliver → MLS decrypt → SQLite
  Note over C,B: recipient offline →<br/>SNS ChatDelivered → SQS → chat-push → APNs/FCM
```

### Trust boundary

The server stores and routes ciphertext only. Plaintext exists solely inside the
device, behind the MLS core and SQLCipher.

```mermaid
flowchart TB
  subgraph Device["Device — plaintext lives here only"]
    P["Plaintext message"] --> M["OpenMLS encrypt"]
    M --> CT["Ciphertext + nonce"]
    K["Group keys · secure enclave"] -.-> M
  end
  subgraph Server["Server — content-blind"]
    CHAT["Chat DO"] --> DB[("Neon: ciphertext rows")]
    CHAT --> BUS["SNS/SQS: ciphertext envelope"]
  end
  CT -->|"WSS"| CHAT
```

---

## Tech stack

| Layer          | Choice                                                                     |
| -------------- | -------------------------------------------------------------------------- |
| Monorepo       | Turborepo + pnpm workspaces                                                |
| Mobile         | React Native (Expo, expo-router) + Tamagui + Zustand                       |
| API            | AWS Lambda · tRPC + Better Auth + Prisma (Neon HTTP adapter)               |
| Realtime       | Cloudflare Worker + Durable Objects (`Chat`, `UserInbox`), msgpack over WS |
| E2EE           | OpenMLS (RFC 9420) Rust core via UniFFI; libsodium primitives              |
| Local storage  | op-sqlite + SQLCipher (encrypted), keys in secure enclave                  |
| Database       | Neon (serverless Postgres) over HTTP — no VPC                              |
| Events         | AWS SNS + SQS (fan-out)                                                    |
| Push           | APNs (HTTP/2) + FCM (HTTP v1) via `chat-push` Lambda                       |
| Media          | Cloudflare R2 (zero egress) + CDN                                          |
| Infrastructure | SST v3 (Pulumi) → AWS + Cloudflare + Neon                                  |
| Docs site      | Next.js (`apps/docs`)                                                      |

---

## Monorepo layout

```
apps/
  mobile        Expo React Native app (chat + social)
  docs          Next.js docs / dashboard site

services/
  api           API Lambda — tRPC + Better Auth (handler: src/lambda.ts)
  upload        Upload Lambda — R2 presigned URLs
  chat-ws       Cloudflare Worker + Chat/UserInbox Durable Objects
  chat-push     APNs/FCM fanout Lambda (content-blind, ADR-0013)

packages/
  chat-mls-core OpenMLS Rust engine + UniFFI bindings (ADR-0015)
  chat-crypto   libsodium primitives (box, sign, seed mgmt)
  chat-db       encrypted local SQLite (op-sqlite + SQLCipher)
  chat-transport WS client to the DO transport (msgpack, reconnect, offline queue)
  chat          chat UI components, hooks, screens, store
  chat-calls    1:1 voice/video (placeholder — M7)
  db-edge       Worker-runtime Neon HTTP client for the persist hot path (ADR-0010)
  database      Prisma schema authority + migrations + seed
  identity      tier permission map (hasPermission)
  schemas       shared zod schemas
  ui            shared React UI
  eslint-config / typescript-config  shared configs

infra/stacks/   SST stack modules (see below)
```

### Infra stacks (`infra/stacks/`, orchestrated by `sst.config.ts`)

**Active:** `secrets`, `chat-push-secrets`, `storage` (R2 + CDN), `events`
(SNS/SQS + `chat-push` subscriber), `api` (API + Upload Lambdas), `chat-ws`
(Worker + DOs).

**Provisioned but not run (deferred):** `vpc` (reactivated when an ECS Fargate
workload ships), `moderation` and `notifications` (Lambda handlers are stubs;
queues already exist in `events`).

---

## Data model (Prisma / Neon)

Key model groups in `packages/database/prisma/schema.prisma`:

- **Auth (Better Auth):** `AuthUser`, `Session`, `AuthAccount`, `Verification`.
- **Identity/social:** `Account`, `Profile`, `ProfileMember`, `IdentityCheck`,
  `Post`, `Comment`, `Like`, `Follow`, `Blocklist`, `Report`.
- **Chat:** `Chat` (+ `mlsGroupId` linkage), `ChatMember`, `ChatMessage`.
- **MLS delivery service:** `KeyPackage`, `GroupCommit`, `GroupWelcome`.
- **Devices/push:** `UserDevice`, `PushToken`.

---

## Prerequisites

- Node.js >= 22 (CI runs 22; repo `engines` allows >= 18)
- pnpm (`corepack use pnpm@latest`) — this is a pnpm workspace, do not use npm/yarn
- Rust toolchain (stable) — only to build the MLS native core _from source_; the
  default setup fetches prebuilt binaries from R2 (Android also needs the NDK to
  build from source)
- Neon account (free) — https://neon.tech
- AWS account — SNS + SQS + Lambda (free tier: 1M requests/mo each)
- Cloudflare account (Workers Paid, ~\$5/mo) — for the DO transport
- Xcode / Android SDK for device + simulator builds

## Setup

### 1. Clone & install dependencies

```bash
git clone https://github.com/lxm7/mortstack.git
cd mortstack
pnpm install
```

### 2. Create a Neon database

Sign up at https://neon.tech (free tier: 0.5GB), create a project, copy the
connection string.

### 3. Create `.env` files

`packages/database/.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/mortstack?sslmode=require"
```

`services/api/.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/mortstack?sslmode=require"
BETTER_AUTH_SECRET="generate-a-random-32-char-string-here"
BETTER_AUTH_URL="http://localhost:3001"
TRUSTED_ORIGINS="http://localhost:3000,http://localhost:8081"
```

For deployed stages, secrets are set via SST instead of `.env`
(`pnpm sst secret set <Name> <value> --stage <stage>`) — Neon URL, Better Auth,
Cloudflare R2 keys, `ChatWsHmacSecret`, APNs/FCM credentials, and the Worker's
SNS-publish IAM keys. See the per-stack comments in `infra/stacks/`.

### 4. Run migrations and seed

```bash
pnpm --filter @repo/database db:migrate:dev
pnpm --filter @repo/database db:seed
```

### 5. Start the API server

```bash
pnpm --filter @repo/api-server dev   # or: pnpm api
```

Runs at http://localhost:3001 — tRPC at `/trpc`, Better Auth at `/auth`.

### 6. Build the app (first run)

The MLS core ships as **prebuilt native binaries** (a Rust core exposed via
UniFFI) that are gitignored. The `rebuild-*` scripts fetch them from R2, run
`expo prebuild`, then compile and install a **dev client** onto your
simulator/device. Boot an emulator/simulator first.

```bash
cd apps/mobile

# Android — emulator or device must be running
pnpm rebuild-android

# iOS — installs CocoaPods during the build
pnpm rebuild-ios
```

> First build compiles native code and is slow. It installs the dev client and
> launches Metro. Do **not** call `npx expo run:*` directly — it skips the R2
> fetch and the app crashes at login with `UnsatisfiedLinkError` (missing
> `libchat_mls_core.so` / `chat_mls_coreFFI`).

### 7. Later launches (native unchanged)

Once the dev client is installed, skip the native build — just start Metro:

```bash
cd apps/mobile
pnpm start   # expo start --dev-client -c
```

> RN/Expo stdout doesn't surface when started from the repo root via pnpm — run
> Expo from `apps/mobile` (or the nested `mobile` filter) so the interactive menu
> shortcuts work.

---

## Running

### Two simulators for chat debugging

```bash
# Terminal 1 — API
pnpm --filter @repo/api-server dev
# Terminal 2 — chat-ws Worker + Durable Objects (local wrangler)
pnpm --filter @repo/chat-ws dev
# Terminal 3 — Metro
pnpm --filter mobile exec expo start --clear

# Boot two sims and tail their logs
xcrun simctl list devices available
xcrun simctl boot <UDID-1> && xcrun simctl boot <UDID-2>
open -a Simulator
pnpm --filter mobile fetch:native:ios   # restore prebuilt binaries before building
pnpm --filter mobile exec expo run:ios --device
```

### Native rebuilds

Rebuild when native code or the MLS core changes. These fetch the prebuilt
binaries from R2, regenerate the native project, then compile:

```bash
cd apps/mobile
pnpm rebuild-android   # or: pnpm rebuild-ios
```

> Always go through `pnpm rebuild-*`. Calling `npx expo run:*` directly skips the
> R2 fetch, leaving `jniLibs`/xcframework empty → `UnsatisfiedLinkError` at login.
> To compile the core from source instead of fetching, set `ALLOW_BUILD=1` (needs
> Rust; Android also the NDK).

---

## Database commands

```bash
pnpm --filter @repo/database db:generate       # regenerate Prisma client
pnpm --filter @repo/database db:migrate:dev    # create/apply migrations
pnpm --filter @repo/database db:seed           # seed test data
pnpm --filter @repo/database db:studio         # open Prisma Studio
```

## Auth

Authentication is handled by **Better Auth** (email/password) at `/auth/*` — not
via tRPC. There is no external auth page; the mobile app has built-in
sign-in/sign-up screens (`apps/mobile/app/(auth)/`) that call Better Auth
directly.

Create an account locally via the app, or POST directly:

```bash
curl -X POST http://localhost:3001/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password","name":"Dev"}'
```

## Seed data

The seed creates test accounts, profiles, posts, follows, comments, and likes for
exercising feed rendering and data relationships. Seed accounts have placeholder
password hashes and **cannot log in via Better Auth** — sign up fresh instead.

## RN device debugging

### Android — WiFi ADB (Android 11+)

1. Developer Options → Wireless debugging
2. "Pair device with pairing code" → note IP, port, code
3. `adb pair <ip>:<port>` → enter code
4. `adb connect <ip>:<port>`
5. `npx expo start --dev-client`

### iOS — Xcode network debugging

1. Cable device once → Xcode → Window → Devices & Simulators
2. Check "Connect via network" → unplug cable (stays paired over WiFi)
3. `npx expo start --dev-client`

### Metro tunnel (cross-network fallback)

```bash
npx expo start --tunnel   # requires @expo/ngrok; slower but works on any network
```

---

## Templating this repo for another project

1. `sst.config.ts` — change `name: "mortstack-chatapp"` per project.
2. Bundle IDs — `io.mortstack.app` in `app.json` + native files per project.
