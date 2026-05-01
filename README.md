# Sessions

For templating multiple on same machine:

1. sst.config.ts — name: 'sessions' needs to change per project
2. Bundle IDs — io.sessions.app in app.json + native files needs to change per
   project

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Mobile**: React Native (Expo) + Tamagui
- **Backend**: tRPC + Better Auth + Prisma
- **Database**: Neon (serverless PostgreSQL)
- **Events**: AWS SNS + SQS (fan-out pattern, replaces Upstash Kafka)
- **Media**: Cloudflare R2 + CDN
- **Blockchain**: SUI (deferred — see `docs/proposals/sui-auth-plugin.md`)
- **Infrastructure**: SST v3 (Pulumi) → AWS + Cloudflare

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
pnpm --filter api dev
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

Authentication is handled by **Better Auth** (email/password only for now). SUI wallet auth is deferred — see `docs/proposals/sui-auth-plugin.md`.

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

```
RN App → Lambda (API) → Neon Postgres
       │              → SNS topics (event bus)
       │                  → SQS ModerationQueue  → Lambda (Moderation)
       │                  → SQS NotificationQueue → Lambda (Notifications)
       │
       ├→ Lambda (Upload) → Cloudflare R2 → CDN
       │
       └→ SUI RPC (direct, client-signed transactions)

ECS Fargate Spot (SUI Indexer) → SUI event stream → SNS → DB

Real-time: Push notifications (Expo Push) + client polling
           WebSocket deferred — see infra/stacks/realtime.ts
```

### Authentication

- **Better Auth** with DB-backed sessions (fully revocable)
- **Email/password**: sign up → creates AuthUser + domain Account (active)
- **SUI wallet (SIWS)**: challenge/response — implemented, deferred
- **zkLogin (Google/Apple → SUI address)**: proposed — see `docs/proposals/sui-auth-plugin.md`
- **Bearer tokens** for React Native (no cookies, stored in SecureStore)
- Session validated in tRPC context via `auth.api.getSession({ headers })`

### Key Design Decisions

- **Account ≠ Profile**: one account can own multiple profiles (musician, band, venue)
- **Identity tiers**: BASIC → CREATOR → ARTIST (gates features like NFT minting)
- **Event-driven**: SNS + SQS fan-out decouples services (moderation, notifications, indexing)
- **Media upload**: presigned URLs → client uploads direct to R2 → no Lambda in the read path

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
