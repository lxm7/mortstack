import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer } from "better-auth/plugins";
import { prisma } from "@repo/database";
import { purgeSessionCache } from "./chat-ws-push";
import { sendEmail, resetPasswordLink } from "./email";
import { verificationEmail, resetPasswordEmail } from "./email-templates";
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
    // Nudge, not a wall: signup still returns a session and the client routes
    // straight into the app. Flip to true (and add the "check your inbox"
    // signup state + a verify landing screen) to gate login on verification.
    requireEmailVerification: false,
    minPasswordLength: 8,
    // Reset flow: forgot-password.tsx calls requestPasswordReset; we build our
    // own deep link with the token so the email opens the app's reset screen
    // directly (no browser bounce). The app calls authClient.resetPassword.
    sendResetPassword: async ({ user, token }) => {
      const { subject, html, text } = resetPasswordEmail(
        resetPasswordLink(token),
      );
      await sendEmail({ to: user.email, subject, html, text });
    },
  },

  // Verification email on signup. Uses Better Auth's server-side `url`
  // (/auth/verify-email?token=…): tapping it verifies and redirects, so no app
  // screen is required for the non-gated flow.
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, html, text } = verificationEmail(url);
      await sendEmail({ to: user.email, subject, html, text });
    },
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
    // Write-through invalidation of the edge session cache (ADR-0017 §3). Fires
    // on sign-out and every revoke path, one place. sha256(session.token) is the
    // KV key the Worker wrote (auth.ts sha256Hex — UTF-8 bytes, lowercase hex),
    // so the digests match. Fire-and-forget: the row is already deleted here
    // (authoritative) and the KV TTL backstops a missed purge, so this must
    // never throw or block the deletion.
    session: {
      delete: {
        after: async (session) => {
          try {
            const hash = createHash("sha256")
              .update(session.token)
              .digest("hex");
            await purgeSessionCache(hash);
          } catch {
            // best-effort; TTL bounds revocation lag
          }
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
