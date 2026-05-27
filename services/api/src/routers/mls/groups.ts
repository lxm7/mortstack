import { TRPCError } from "@trpc/server";
import { Prisma } from "@repo/database";
import {
  PublishCommitInput,
  FetchPendingCommitsInput,
  FetchPendingCommitsOutput,
  PublishWelcomesInput,
  PublishWelcomesOutput,
  FetchPendingWelcomesOutput,
  FETCH_PENDING_COMMITS_PAGE_MAX,
  FETCH_PENDING_WELCOMES_PAGE_MAX,
} from "@repo/chat-mls-core/wire";
import { router, protectedProcedure } from "../../trpc";
import { notifyMlsWelcome } from "../../lib/chat-ws-push";

// ── mls.groups.* ─────────────────────────────────────────────────────────────
// Delivery Service for MLS — commit log + welcome routing per ADR-015 §6/§7.
// Server stores opaque bytes; the only structural invariant it enforces is
// the per-group epoch UNIQUE constraint (the ordering gate).

function decodeB64Strict(s: string): Uint8Array {
  return new Uint8Array(Buffer.from(s, "base64"));
}

// Postgres unique-violation code. Surfaces from the ordering gate when two
// commits race at the same epoch; the loser fetches pending + retries.
const PG_UNIQUE_VIOLATION = "P2002"; // Prisma's wrapper code for 23505

export const groupsRouter = router({
  // Publish a Commit message for a group at a specific epoch. The
  // @@unique([groupId, epoch]) gate is what serialises concurrent commits:
  // the racing loser hits a P2002 and surfaces a 409 CONFLICT so the
  // client knows to fetch pending + retry with epoch+1.
  //
  // No membership check here — Phase 1 trusts the caller's MLS engine
  // state. A future hardening pass (M7+) can require the caller's leaf
  // index match a server-recorded view derived from the commit stream.
  publishCommit: protectedProcedure
    .input(PublishCommitInput)
    .mutation(async ({ input, ctx }) => {
      const groupId = Buffer.from(decodeB64Strict(input.groupIdB64));
      const commitBytes = Buffer.from(decodeB64Strict(input.commitB64));

      try {
        const row = await ctx.prisma.groupCommit.create({
          data: {
            groupId,
            epoch: input.epoch,
            bytes: commitBytes,
          },
          select: { id: true, epoch: true, createdAt: true },
        });
        return {
          id: row.id,
          epoch: row.epoch,
          createdAt: row.createdAt.toISOString(),
        };
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === PG_UNIQUE_VIOLATION
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `epoch ${input.epoch} already published for this group — fetch pending commits and retry with the next epoch`,
            cause: {
              groupIdB64: input.groupIdB64,
              attemptedEpoch: input.epoch,
            },
          });
        }
        throw err;
      }
    }),

  // Range-scan commits with epoch ≥ sinceEpoch for a group. Caller paginates
  // by passing the highest epoch seen as `sinceEpoch + 1` on the next call.
  // Read-only — no consume semantics; commits are retained per ADR-015 §9
  // (MLS Resync compaction lands with M8).
  fetchPendingCommits: protectedProcedure
    .input(FetchPendingCommitsInput)
    .output(FetchPendingCommitsOutput)
    .query(async ({ input, ctx }) => {
      const groupId = Buffer.from(decodeB64Strict(input.groupIdB64));
      const rows = await ctx.prisma.groupCommit.findMany({
        where: { groupId, epoch: { gte: input.sinceEpoch } },
        orderBy: { epoch: "asc" },
        take: FETCH_PENDING_COMMITS_PAGE_MAX,
        select: { epoch: true, bytes: true },
      });
      return {
        commits: rows.map((r) => ({
          epoch: r.epoch,
          commitB64: Buffer.from(r.bytes).toString("base64"),
        })),
      };
    }),

  // Publish Welcomes to one or more recipient accounts after a successful
  // add_members commit. One row per recipient (the blob bytes are
  // duplicated — see GroupWelcome model header; the storage cost is
  // negligible at Phase 1 sizes and routing is trivial).
  //
  // Recipients are validated to exist as real Accounts so a malicious
  // sender can't fan-out fake rows that survive in the table.
  publishWelcomes: protectedProcedure
    .input(PublishWelcomesInput)
    .output(PublishWelcomesOutput)
    .mutation(async ({ input, ctx }) => {
      const groupId = Buffer.from(decodeB64Strict(input.groupIdB64));

      const recipientIds = Array.from(
        new Set(input.recipients.map((r) => r.recipientAccountId)),
      );
      const accounts = await ctx.prisma.account.findMany({
        where: { id: { in: recipientIds } },
        select: { id: true },
      });
      const validIds = new Set(accounts.map((a) => a.id));
      const missing = recipientIds.filter((id) => !validIds.has(id));
      if (missing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `unknown recipientAccountId(s): ${missing.join(", ")}`,
        });
      }

      const data = input.recipients.map((r) => ({
        recipientAccountId: r.recipientAccountId,
        recipientDeviceId: r.recipientDeviceId ?? null,
        groupId,
        bytes: Buffer.from(decodeB64Strict(r.welcomeB64)),
      }));

      const result = await ctx.prisma.groupWelcome.createMany({ data });

      // Best-effort wake-up so peers consume the Welcome instantly instead
      // of waiting for the 30s background poll. Failure is silently swallowed
      // — the poll path is the correctness guarantee. Resolves accountIds →
      // authUserIds (UserInbox DOs key on authUserId).
      const recipientAccounts = await ctx.prisma.account.findMany({
        where: { id: { in: recipientIds } },
        select: { authUserId: true },
      });
      void notifyMlsWelcome(recipientAccounts.map((a) => a.authUserId));

      return { delivered: result.count };
    }),

  // Consume-on-fetch Welcomes addressed to the calling account. Each row
  // is DELETEd in the same SQL statement that returns it — a Welcome is
  // seen exactly once per account regardless of how many devices poll.
  // (The recipientDeviceId column is informational here; the engine's
  // joinFromWelcome silently no-ops on a Welcome it can't decrypt, so any
  // device that gets the row first wins.)
  fetchPendingWelcomes: protectedProcedure
    .output(FetchPendingWelcomesOutput)
    .query(async ({ ctx }) => {
      const rows = await ctx.prisma.$queryRaw<
        Array<{ id: string; groupId: Buffer; bytes: Buffer }>
      >`
        WITH consumed AS (
          SELECT "id"
          FROM "GroupWelcome"
          WHERE "recipientAccountId" = ${ctx.account.id}
          ORDER BY "id"
          FOR UPDATE SKIP LOCKED
          LIMIT ${FETCH_PENDING_WELCOMES_PAGE_MAX}
        )
        DELETE FROM "GroupWelcome"
        WHERE "id" IN (SELECT "id" FROM consumed)
        RETURNING "id", "groupId", "bytes"
      `;

      return {
        welcomes: rows.map((r) => ({
          id: r.id,
          groupIdB64: Buffer.from(r.groupId).toString("base64"),
          welcomeB64: Buffer.from(r.bytes).toString("base64"),
        })),
      };
    }),
});
