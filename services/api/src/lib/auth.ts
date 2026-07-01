import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "@repo/database";
// ── Better Auth server instance ───────────────────────────────────────────────
// Sessions are DB-backed (via Prisma) — fully revocable on logout or ban.
// The `bearer` plugin enables Authorization: Bearer <token> for API clients
// (React Native has no cookie jar, so bearer is the only viable session carrier).
//
// Model mapping:
//   Better Auth `user`         → Prisma `AuthUser`
//   Better Auth `session`      → Prisma `Session`
//   Better Auth `verification` → Prisma `Verification`
//
// The domain `Account` model (with Profiles, identityTier, etc.) links to
// AuthUser via authUserId. Auth identity is separate from domain identity.
//
// SUI wallet plugin: see docs/proposals/sui-auth-plugin.md
// Activate by importing suiWalletPlugin from ./sui-auth-plugin and adding to plugins[]

// Production must pin the auth origin explicitly. A static baseURL means Better
// Auth never infers the origin from the request Host — closing the CSRF
// origin-check bypass that Host/domainName spoofing would open if the Lambda is
// ever fronted by a proxy/CDN that derives domainName from the client Host.
// Non-prod (incl. the deployed dev/demo stage, which runs NODE_ENV=development)
// keeps request-inferred baseURL so there's no per-deploy URL to manage.
if (process.env.NODE_ENV === "production" && !process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL must be set in production");
}

export const auth = betterAuth({
  // Not forced to a localhost fallback: when BETTER_AUTH_URL is unset (the
  // deployed Lambda case), Better Auth infers the base URL from the incoming
  // request — and the adapter builds request.url from the Function URL domain
  // (lambda.ts), so the inferred origin is the Lambda URL the mobile client
  // stamps as its Origin. That inferred origin is auto-trusted by the CSRF
  // origin check, so no per-deploy URL needs managing. Locally, inference
  // resolves to http://localhost:3001 the same way. Set BETTER_AUTH_URL
  // explicitly only for production hardening (pin the origin vs Host-spoofing).
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/auth",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Model name mapping — Prisma schema uses prefixed names to avoid
  // collision with the domain Account model
  user: {
    modelName: "AuthUser",
  },
  account: {
    modelName: "AuthAccount",
  },

  // Email + password auth (web2 path)
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // set true when email provider is wired
    minPasswordLength: 8,
  },

  // On new email signup, create linked domain Account
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.account.upsert({
            where: { authUserId: user.id },
            update: {},
            create: {
              authUserId: user.id,
              email: user.email,
            },
          });
        },
      },
    },
  },

  session: {
    // DB-backed sessions — revocable at any time
    strategy: "database",
    // 30-day sessions, refreshed on each request
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24, // refresh if >1 day old
  },

  plugins: [
    // Required for RN: sends session token in response header `set-auth-token`
    // Client reads it and stores in SecureStore
    bearer(),
  ],

  trustedOrigins: (
    process.env.TRUSTED_ORIGINS ?? "http://localhost:3000"
  ).split(","),
});

export type Auth = typeof auth;
