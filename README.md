# Mortstack

[![CI](https://github.com/lxm7/mortstack/actions/workflows/ci.yml/badge.svg)](https://github.com/lxm7/mortstack/actions/workflows/ci.yml)

For templating multiple on same machine:

1. sst.config.ts — name: 'mortstack' needs to change per project
2. Bundle IDs — io.mortstack.app in app.json + native files needs to change per
   project

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Mobile**: React Native (Expo) + Tamagui
- **Backend**: tRPC + Better Auth + Prisma (Neon HTTP driver adapter)
- **Database**: Neon (serverless PostgreSQL, accessed over HTTP — no VPC required)
- **Events**: AWS SNS + SQS (fan-out pattern)
- **Media**: Cloudflare R2 & DO's + CDN (zero egress)
- **Infrastructure**: SST v3 (Pulumi) → AWS Lambda + Cloudflare

## Run

Note: RN/Expo's stdout doesnt work running from root with pnpm, ensure nested scripts are ultimately ran for expected Expo menu shortcuts

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
Terminal 3: pnpm --filter mobile exec expo start --clear
Terminal 4: xcrun simctl list devices available
Terminal 4: xcrun simctl terminate <UDID> io.sessions.app
Terminal 4: sleep 1
Terminal 4: xcrun simctl boot <UDID-1> log
stream ... # sim 1 logs  
Terminal 5: xcrun simctl boot <UDID-2> log  
 stream ... # sim 2 logs
Terminal 5: open -a Simulator
Terminal 5: pnpm expo run:ios --device

### General running:

xcrun simctl list devices available
pnpm --filter mobile start
pnpm --filter mobile exec expo run:ios --device "$sim1"

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
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/mortstack?sslmode=require"
```

`services/api/.env`:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/mortstack?sslmode=require"
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

Authentication is handled by **Better Auth** (email/password).

There is no external auth page. The mobile app has built-in sign-in/sign-up screens (`apps/mobile/app/(auth)/`) that call Better Auth's API directly.

To create an account locally, use the sign-up screen in the app or POST directly:

```bash
curl -X POST http://localhost:3001/auth/sign-up/email \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password","name":"Dev"}'
```

## Seed Data

The seed creates test accounts, profiles, posts, follows, comments, and likes. Seed accounts have placeholder password hashes and **cannot be used to log in via Better Auth** — sign up fresh instead. The seed data is useful for testing feed rendering, profile views, and data relationships.

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
       └──► Lambda (Upload, public)        ──► Cloudflare R2 ──► Cloudflare CDN

Real-time:   Expo Push + client polling
WebSocket:   deferred (see infra/stacks/realtime.ts)
VPC:         deferred — provisioned only when an ECS Fargate workload ships
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
                                          ├─► Upstash Redis (mortstack, rate limit, feed cache)
                                          ├─► SNS / SQS  (event bus, unchanged)
                                          ├─► Search (Typesense / Meilisearch on Fargate)
                                          └─► OpenTelemetry → Axiom / Sentry

Cloudflare Durable Objects ──► WebSocket / chat / live presence

Timeline service (fan-out-on-write) ─► Redis lists per follower ─► hydrate from Postgres
```

| Phase 2 component                     | Trigger to add                             | Approx cost at 100k DAU                           |
| ------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| Upstash Redis                         | session p50 >50ms or DAU >5k               | $5-30/mo                                          |
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
