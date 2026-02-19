# Architecture Overview

Enterprise React Native social media app with SUI blockchain integration.

## Tech Stack

- **Monorepo**: NX
- **Backend**: tRPC + Prisma + PostgreSQL + Redis
- **Mobile**: React Native (Expo)
- **Web**: Next.js
- **Blockchain**: SUI
- **Infrastructure**: AWS (Lambda, RDS, S3, CloudFront)

## Project Structure

```
sessions/
├── apps/
│   ├── mobile/         # React Native (Expo) - TODO
│   ├── web/            # Next.js app
│   └── docs/           # Documentation site
│
├── packages/
│   ├── database/       # Prisma client & schemas
│   ├── auth/           # JWT + SUI wallet auth
│   ├── api/            # tRPC React client
│   ├── ui/             # Shared UI components
│   ├── eslint-config/  # ESLint configs
│   └── typescript-config/ # TypeScript configs
│
├── services/
│   └── api/            # tRPC server (deploys to Lambda)
│
└── infra/              # AWS CDK - TODO
```

## Database Schema

### User Model

- Supports both wallet auth (SUI) and traditional email/password
- Trust & safety: reputation, verification, banning
- Relations: posts, comments, likes, follows, NFTs

### Content Models

- **Post**: Social media posts (text, images, videos, audio, performances)
- **Comment**: Comments on posts
- **Like**: Post likes
- **Follow**: User follow relationships

### NFT Model

- Links to SUI blockchain objects
- Supports music, performances, art, collectibles
- Marketplace integration (listing, pricing)

## Authentication

### Wallet Authentication (Primary)

1. Client requests nonce
2. User signs nonce with SUI wallet
3. Server verifies signature
4. Server issues JWT access + refresh tokens

### Traditional Authentication (Optional)

- Email/password sign up and sign in
- bcrypt password hashing
- Same JWT flow

## API Architecture

### tRPC Routers

- **auth**: Sign in, sign up, wallet authentication
- **user**: Profile management, follow/unfollow
- **post**: Feed, create posts, like, comment

### Deployment

- **Development**: Standalone HTTP server (localhost:3001)
- **Production**: AWS Lambda + API Gateway

## Offline Strategy (Hybrid)

- **Offline reads**: All data cached locally (SQLite)
- **Offline writes**: Drafts saved locally, require online for posting
- **Online required**: Creating posts, comments, likes, follows

## Security

- JWT with short-lived access tokens (15min) and refresh tokens (7d)
- SUI wallet signature verification for wallet auth
- Rate limiting via middleware (TODO)
- Content moderation via trust & safety fields

## Next Steps

1. ✅ Setup backend with tRPC and Prisma
2. ✅ Create shared packages structure
3. 🔲 Setup AWS infrastructure with CDK
4. 🔲 Create React Native mobile app
5. 🔲 Implement offline sync layer
6. 🔲 Build SUI wallet integration
7. 🔲 NFT minting and marketplace
8. 🔲 Content moderation system
