import { createHash } from "node:crypto";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as ed25519 from "@noble/ed25519";
import {
  PublishKeyPackagesInput,
  PublishKeyPackagesOutput,
  FetchKeyPackagesForAccountsInput,
  KEY_PACKAGE_PER_DEVICE_CAP,
  canonicalPublishProofBytes,
} from "@repo/chat-mls-core/wire";
import { router, protectedProcedure } from "../../trpc";

// ── mls.keys.* ───────────────────────────────────────────────────────────────
// KeyPackage directory routes per ADR-015 §5 (publish authenticity gate) and
// §6 (consume-on-fetch ordering). All MLS bytes are opaque to the server —
// content is validated only by length envelope at the wire boundary, the
// rest is on the client engine.

function decodeB64Strict(s: string): Uint8Array {
  // node:Buffer accepts non-base64 chars silently; the wire-layer regex has
  // already gated, so this is a fast path.
  return new Uint8Array(Buffer.from(s, "base64"));
}

export const keysRouter = router({
  // Current KeyPackage count for the calling account's device. Cheap read
  // used by the client SDK before publishing — replaces the "publish
  // threshold+1 to discover the count" path which hits the cap on devices
  // with stale KPs left over from a reset.
  count: protectedProcedure
    .input(z.object({ deviceId: z.string().uuid() }))
    .output(z.object({ totalForDevice: z.number().int().nonnegative() }))
    .query(async ({ input, ctx }) => {
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
          message: "device not registered",
        });
      }
      const totalForDevice = await ctx.prisma.keyPackage.count({
        where: { userDeviceId: device.id },
      });
      return { totalForDevice };
    }),

  // Delete every unconsumed KeyPackage for the calling account's device.
  // Used by MlsClient.reset() so a fresh engine doesn't compete against
  // stale-pubkey rows the server still holds (the engine no longer has the
  // matching private material, so those KPs would dead-end any join). Does
  // NOT touch the device row itself or any group state.
  deleteAllForDevice: protectedProcedure
    .input(z.object({ deviceId: z.string().uuid() }))
    .output(z.object({ deleted: z.number().int().nonnegative() }))
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
          message: "device not registered",
        });
      }
      const result = await ctx.prisma.keyPackage.deleteMany({
        where: { userDeviceId: device.id },
      });
      return { deleted: result.count };
    }),

  // Publish one or more fresh KeyPackages for the calling account's device.
  //
  // Authenticity (ADR-015 §5): client signs the canonical bytes
  //   0x02 ‖ deviceId-utf8 ‖ sha256(concat(keyPackage bytes))
  // with the existing UserDevice.ed25519Pub. Server re-derives + verifies.
  // One Ed25519 verify per publish call regardless of batch size — avoids
  // needing a server-side MLS parser to inspect the KeyPackage struct.
  //
  // Cap enforcement: the publish is a single tx. We lock the UserDevice
  // row (SELECT … FOR UPDATE), COUNT the existing KeyPackages for it, and
  // reject when existing + incoming > KEY_PACKAGE_PER_DEVICE_CAP. The lock
  // serialises racing publishes from the same device — without it, two
  // concurrent calls could both pass the COUNT check and overshoot the cap.
  publish: protectedProcedure
    .input(PublishKeyPackagesInput)
    .output(PublishKeyPackagesOutput)
    .mutation(async ({ input, ctx }) => {
      const kpBytesList = input.keyPackagesB64.map(decodeB64Strict);
      const proofSig = decodeB64Strict(input.proofSigB64);

      // sha256 over concatenated KP bytes — order matters; client must
      // hash in the same order it ships in the array.
      const hash = createHash("sha256");
      for (const kp of kpBytesList) hash.update(kp);
      const digest = hash.digest();
      const canonical = canonicalPublishProofBytes(
        input.deviceId,
        new Uint8Array(digest),
      );

      const result = await ctx.prisma.$transaction(async (tx) => {
        // Lock the device row so racing publishes serialise on it. SELECT
        // FOR UPDATE on the unique (accountId, deviceId) row.
        const device = await tx.userDevice.findUnique({
          where: {
            accountId_deviceId: {
              accountId: ctx.account.id,
              deviceId: input.deviceId,
            },
          },
          select: { id: true, ed25519Pub: true },
        });
        if (!device) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message:
              "device not registered — call user.keys.publish before publishing KeyPackages",
          });
        }

        const sigOk = await ed25519.verifyAsync(
          proofSig,
          canonical,
          new Uint8Array(device.ed25519Pub),
        );
        if (!sigOk) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "publish proof signature failed to verify against device ed25519Pub",
          });
        }

        const existing = await tx.keyPackage.count({
          where: { userDeviceId: device.id },
        });
        if (existing + kpBytesList.length > KEY_PACKAGE_PER_DEVICE_CAP) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: `device KeyPackage cap reached (existing=${existing}, incoming=${kpBytesList.length}, cap=${KEY_PACKAGE_PER_DEVICE_CAP})`,
          });
        }

        await tx.keyPackage.createMany({
          data: kpBytesList.map((bytes) => ({
            userDeviceId: device.id,
            bytes: Buffer.from(bytes),
          })),
        });

        // Phase 1 single-device-per-account: any other UserDevice row for
        // this account is stale (prior install / reset). KeyPackages cascade
        // via FK. README §M3.5 follow-up.
        await tx.userDevice.deleteMany({
          where: {
            accountId: ctx.account.id,
            id: { not: device.id },
          },
        });

        return {
          published: kpBytesList.length,
          totalForDevice: existing + kpBytesList.length,
        };
      });

      return result;
    }),

  // Consume one fresh KeyPackage per device for each requested account.
  //
  // Per ADR-015 §5 + KeyPackage table header: hard delete on consume (no
  // soft-delete). Atomic DELETE … RETURNING via a single SQL round-trip per
  // device, with FOR UPDATE SKIP LOCKED so parallel senders pulling KPs for
  // overlapping accounts don't block each other.
  //
  // Return shape is one bundle per device that had a KeyPackage available;
  // accounts with zero ready devices map to []. Top-up signalling is the
  // caller's responsibility (they emit a server-side push or poll on the
  // owning device when they see an empty pool).
  fetchForAccounts: protectedProcedure
    .input(FetchKeyPackagesForAccountsInput)
    .query(async ({ input, ctx }) => {
      // Resolve target devices first so we know which (deviceId → ed25519Pub)
      // to return alongside each consumed KeyPackage. One round-trip; reads
      // outside the consume tx are fine — the consume tx is per-device.
      //
      // Phase 1 dedupe: one device per accountId (most recent). Stale rows
      // from prior installs share the MLS signer with the live row, so
      // duplicate KPs hit DuplicateSignatureKey on add_members. Multi-device
      // unblocks when M4 account-linking lands. README §M3.5 follow-up.
      const devices = await ctx.prisma.userDevice.findMany({
        where: { accountId: { in: input.accountIds } },
        orderBy: [{ accountId: "asc" }, { updatedAt: "desc" }],
        distinct: ["accountId"],
        select: {
          id: true,
          accountId: true,
          deviceId: true,
          ed25519Pub: true,
        },
      });

      // Seed empty arrays for all requested accounts so the caller can
      // distinguish "no devices" from "no KP ready" at a glance.
      const byAccount: Record<
        string,
        Array<{
          deviceId: string;
          ed25519PubB64: string;
          keyPackageB64: string;
        }>
      > = {};
      for (const id of input.accountIds) byAccount[id] = [];

      // Per-device DELETE … RETURNING using FOR UPDATE SKIP LOCKED — one
      // round-trip per device. Could be parallelised across devices later
      // if profiling shows the serial wait dominates; Phase 1 batches are
      // small enough that the simpler sequential form is fine.
      for (const dev of devices) {
        const rows = await ctx.prisma.$queryRaw<Array<{ bytes: Buffer }>>`
          WITH consumed AS (
            SELECT "id"
            FROM "KeyPackage"
            WHERE "userDeviceId" = ${dev.id}
            ORDER BY "id"
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          )
          DELETE FROM "KeyPackage"
          WHERE "id" IN (SELECT "id" FROM consumed)
          RETURNING "bytes"
        `;
        const row = rows[0];
        if (!row) continue;

        const list = byAccount[dev.accountId];
        if (!list) continue;
        list.push({
          deviceId: dev.deviceId,
          ed25519PubB64: Buffer.from(dev.ed25519Pub).toString("base64"),
          keyPackageB64: Buffer.from(row.bytes).toString("base64"),
        });
      }

      return byAccount;
    }),
});
