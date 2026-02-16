# Getting Started

## Prerequisites

- Node.js >= 18
- PostgreSQL (local or cloud)
- npm 11.6.2+

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Create a PostgreSQL database:

```bash
createdb myapp
```

Copy environment file:

```bash
cp packages/database/.env.example packages/database/.env
```

Update `packages/database/.env` with your database URL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/myapp?schema=public"
```

### 3. Run Migrations

```bash
cd packages/database
npm run db:migrate:dev
```

This will:
- Create all tables based on the Prisma schema
- Generate Prisma Client

### 4. Start Development Servers

#### Backend API (tRPC)

```bash
cd services/api
npm run dev
```

Server runs on `http://localhost:3001`

#### Web App (Next.js)

```bash
cd apps/web
npm run dev
```

App runs on `http://localhost:3000`

## Project Commands

### Root Level

```bash
# Build all projects
npm run build

# Run all dev servers
npm run dev

# Lint all projects
npm run lint

# Format code
npm run format

# Type check
npm run check-types
```

### Database

```bash
cd packages/database

# Generate Prisma Client
npm run db:generate

# Push schema changes (dev)
npm run db:push

# Run migrations (dev)
npm run db:migrate:dev

# Deploy migrations (prod)
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio
```

### API Service

```bash
cd services/api

# Dev server (hot reload)
npm run dev

# Build for production
npm run build

# Build for Lambda
npm run lambda:build
```

## Testing the API

### Using curl

```bash
# Get nonce for wallet auth
curl -X POST http://localhost:3001/trpc/auth.getNonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x123..."}'

# Get feed
curl http://localhost:3001/trpc/post.getFeed
```

### Using the web app

1. Start both web and API servers
2. Configure `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/web/.env.local`
3. Import tRPC client and use it in your components

## Environment Variables

### packages/database/.env
```
DATABASE_URL="postgresql://..."
```

### services/api/.env
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## Troubleshooting

### Prisma Client not found

Run:
```bash
cd packages/database
npm run db:generate
```

### Database connection failed

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `.env`
3. Verify database exists

### Port already in use

Change ports in:
- `services/api/src/server.ts` (API)
- `apps/web/package.json` dev script (Web)
