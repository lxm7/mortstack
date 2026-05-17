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

export const userRouter = router({
  keys: keysRouter,
});
