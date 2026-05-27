import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as ed25519 from "@noble/ed25519";
import { router, protectedProcedure } from "../trpc";

// Wire format: pubkeys + signature travel as standard base64 strings. Picked
// for ~30% smaller payload vs hex and parity with SUI's convention. Raw bytes
// land in Postgres `bytea`; encoding lives only at the HTTP boundary.
const ED25519_PUB_BYTES = 32;
const X25519_PUB_BYTES = 32;
const ED25519_SIG_BYTES = 64;
const BUNDLE_VERSION = 0x01;
const BYUSER_IDS_BATCH_MAX = 100;

// Canonical bytes the client signs and the server re-verifies.
// Format: 0x01 ‖ deviceId-utf8 ‖ ed25519Pub ‖ x25519Pub
// The leading version byte aligns with README §M3 invariant #5 (every crypto
// frame carries a `v` byte for M3 → M3.5 forward-compat).
function canonicalBundleBytes(
  deviceId: string,
  ed25519Pub: Uint8Array,
  x25519Pub: Uint8Array,
): Uint8Array {
  const deviceIdBytes = new TextEncoder().encode(deviceId);
  const out = new Uint8Array(
    1 + deviceIdBytes.length + ed25519Pub.length + x25519Pub.length,
  );
  out[0] = BUNDLE_VERSION;
  out.set(deviceIdBytes, 1);
  out.set(ed25519Pub, 1 + deviceIdBytes.length);
  out.set(x25519Pub, 1 + deviceIdBytes.length + ed25519Pub.length);
  return out;
}

function decodeB64(s: string, expected: number, name: string): Uint8Array {
  const buf = Buffer.from(s, "base64");
  if (buf.length !== expected) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${name} must decode to ${expected} bytes, got ${buf.length}`,
    });
  }
  return new Uint8Array(buf);
}

const PublishInput = z.object({
  deviceId: z.string().uuid(),
  ed25519PubB64: z.string().min(1),
  x25519PubB64: z.string().min(1),
  bundleSigB64: z.string().min(1),
});

const ByUserIdsInput = z.object({
  accountIds: z.array(z.string().cuid()).min(1).max(BYUSER_IDS_BATCH_MAX),
});

const keysRouter = router({
  publish: protectedProcedure
    .input(PublishInput)
    .mutation(async ({ input, ctx }) => {
      const ed25519Pub = decodeB64(
        input.ed25519PubB64,
        ED25519_PUB_BYTES,
        "ed25519Pub",
      );
      const x25519Pub = decodeB64(
        input.x25519PubB64,
        X25519_PUB_BYTES,
        "x25519Pub",
      );
      const bundleSignature = decodeB64(
        input.bundleSigB64,
        ED25519_SIG_BYTES,
        "bundleSig",
      );

      const bundle = canonicalBundleBytes(
        input.deviceId,
        ed25519Pub,
        x25519Pub,
      );

      const sigOk = await ed25519.verifyAsync(
        bundleSignature,
        bundle,
        ed25519Pub,
      );
      if (!sigOk) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "bundleSignature failed to verify against ed25519Pub",
        });
      }

      const row = await ctx.prisma.userDevice.upsert({
        where: {
          accountId_deviceId: {
            accountId: ctx.account.id,
            deviceId: input.deviceId,
          },
        },
        create: {
          accountId: ctx.account.id,
          deviceId: input.deviceId,
          ed25519Pub: Buffer.from(ed25519Pub),
          x25519Pub: Buffer.from(x25519Pub),
          bundleSignature: Buffer.from(bundleSignature),
        },
        update: {
          ed25519Pub: Buffer.from(ed25519Pub),
          x25519Pub: Buffer.from(x25519Pub),
          bundleSignature: Buffer.from(bundleSignature),
        },
        select: { id: true, deviceId: true, updatedAt: true },
      });

      return row;
    }),

  byUserIds: protectedProcedure
    .input(ByUserIdsInput)
    .query(async ({ input, ctx }) => {
      const rows = await ctx.prisma.userDevice.findMany({
        where: { accountId: { in: input.accountIds } },
        select: {
          accountId: true,
          deviceId: true,
          ed25519Pub: true,
          x25519Pub: true,
          updatedAt: true,
          // MLS columns (mlsCredentialId etc.) land here in Chunk 4 once
          // KeyPackage publish + fetch routers ship.
        },
      });

      const byAccount: Record<
        string,
        Array<{
          deviceId: string;
          ed25519PubB64: string;
          x25519PubB64: string;
          updatedAt: string;
        }>
      > = {};
      for (const id of input.accountIds) byAccount[id] = [];
      for (const r of rows) {
        const list = byAccount[r.accountId];
        if (!list) continue;
        list.push({
          deviceId: r.deviceId,
          ed25519PubB64: Buffer.from(r.ed25519Pub).toString("base64"),
          x25519PubB64: Buffer.from(r.x25519Pub).toString("base64"),
          updatedAt: r.updatedAt.toISOString(),
        });
      }
      return byAccount;
    }),
});

// ── user.push.* ─────────────────────────────────────────────────────────────
// APNs / FCM token registration for M6 push fanout. Tokens live one-per-row
// in PushToken with FK → UserDevice. Idempotent upsert on token UNIQUE so
// re-registers after app launch don't churn rows.
//
// The caller scopes by deviceId (the client-generated UUID already used by
// keys.publish) — we look up the UserDevice and verify it belongs to the
// authenticated Account before touching tokens.

const PUSH_TOKEN_MIN = 16;
const PUSH_TOKEN_MAX = 4096; // FCM tokens can run >1KB; APNs are 64 hex chars.

const PushRegisterInput = z.object({
  deviceId: z.string().uuid(),
  platform: z.enum(["APNS", "FCM"]),
  token: z.string().min(PUSH_TOKEN_MIN).max(PUSH_TOKEN_MAX),
  appBundleId: z.string().min(1).max(255),
});

const PushUnregisterInput = z.object({
  token: z.string().min(PUSH_TOKEN_MIN).max(PUSH_TOKEN_MAX),
});

const pushRouter = router({
  register: protectedProcedure
    .input(PushRegisterInput)
    .mutation(async ({ input, ctx }) => {
      const device = await ctx.prisma.userDevice.findUnique({
        where: {
          accountId_deviceId: {
            accountId: ctx.account.id,
            deviceId: input.deviceId,
          },
        },
        select: { id: true },
      });
      if (!device) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "userDevice not found — publish keys before registering a push token",
        });
      }

      // Upsert on token (UNIQUE). If a token re-appears on a different
      // device (rare: app re-install reusing the same APNs token), we
      // rebind it to the caller's device — last writer wins, matching
      // APNs/FCM single-owner semantics.
      const row = await ctx.prisma.pushToken.upsert({
        where: { token: input.token },
        create: {
          userDeviceId: device.id,
          platform: input.platform,
          token: input.token,
          appBundleId: input.appBundleId,
        },
        update: {
          userDeviceId: device.id,
          platform: input.platform,
          appBundleId: input.appBundleId,
          lastSeenAt: new Date(),
          disabledAt: null,
        },
        select: { id: true, lastSeenAt: true },
      });
      return row;
    }),

  unregister: protectedProcedure
    .input(PushUnregisterInput)
    .mutation(async ({ input, ctx }) => {
      // Tombstone (set disabledAt) rather than delete — keeps the row for
      // the dead-token cleanup contract (D7) and prevents racing
      // re-registrations during sign-out.
      await ctx.prisma.pushToken.updateMany({
        where: {
          token: input.token,
          device: { accountId: ctx.account.id },
        },
        data: { disabledAt: new Date() },
      });
      return { ok: true as const };
    }),
});

// ── user.search ─────────────────────────────────────────────────────────────
// Handle-prefix lookup for the M4 "New Chat" picker. Resolves to the
// Profile's primary OWNER Account so the caller can issue chat.create with
// the returned accountId.
//
// Excludes the caller's own accounts; min query length 2 to avoid full-
// table scans on empty / 1-char queries.

const USER_SEARCH_QUERY_MIN = 2;
const USER_SEARCH_QUERY_MAX = 32;
const USER_SEARCH_LIMIT_MAX = 50;

const SearchInput = z.object({
  query: z.string().min(USER_SEARCH_QUERY_MIN).max(USER_SEARCH_QUERY_MAX),
  limit: z.number().int().min(1).max(USER_SEARCH_LIMIT_MAX).default(20),
});

export const userRouter = router({
  keys: keysRouter,
  push: pushRouter,

  search: protectedProcedure
    .input(SearchInput)
    .output(
      z.object({
        users: z.array(
          z.object({
            accountId: z.string(),
            handle: z.string(),
            displayName: z.string(),
          }),
        ),
      }),
    )
    .query(async ({ input, ctx }) => {
      // Handle prefix match — backed by the unique index on Profile.handle.
      // Postgres B-tree on text supports prefix LIKE without a separate
      // index. Returns the oldest OWNER ProfileMember's account per
      // matching Profile (primary persona disambiguation for Phase 1).
      const profiles = await ctx.prisma.profile.findMany({
        where: {
          handle: { startsWith: input.query.toLowerCase() },
          isBanned: false,
        },
        orderBy: { handle: "asc" },
        take: input.limit,
        select: {
          handle: true,
          displayName: true,
          members: {
            where: { role: "OWNER", account: { isBanned: false } },
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { accountId: true },
          },
        },
      });

      const users = profiles
        .map((p) => {
          const accountId = p.members[0]?.accountId;
          if (!accountId) return null;
          if (accountId === ctx.account.id) return null;
          return {
            accountId,
            handle: p.handle,
            displayName: p.displayName,
          };
        })
        .filter((u): u is NonNullable<typeof u> => u !== null);

      return { users };
    }),
});
