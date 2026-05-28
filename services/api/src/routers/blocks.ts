import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "../trpc";

// Block surface — App Store Guideline 1.2 (UGC) + Play Store UGC policy.
//
// Two parties are linked symmetrically for chat-creation gating: if A blocks
// B, neither party can start a new direct chat with the other. Existing
// group chats are intentionally NOT pruned at the server in Phase 1 — the
// client filters incoming messages from blocked senders as defence in depth.
// A future server-side fanout filter (chat-ws) is tracked but deferred.

const AccountIdSchema = z.string().min(1).max(50);

export const blocksRouter = router({
  add: protectedProcedure
    .input(z.object({ accountId: AccountIdSchema }))
    .mutation(async ({ ctx, input }) => {
      if (input.accountId === ctx.account.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot block yourself",
        });
      }
      // Verify the target account exists so we don't accumulate orphan rows.
      const target = await ctx.prisma.account.findUnique({
        where: { id: input.accountId },
        select: { id: true },
      });
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account not found",
        });
      }
      // Upsert — idempotent re-block returns the same row without error.
      await ctx.prisma.blocklist.upsert({
        where: {
          blockerAccountId_blockedAccountId: {
            blockerAccountId: ctx.account.id,
            blockedAccountId: input.accountId,
          },
        },
        create: {
          blockerAccountId: ctx.account.id,
          blockedAccountId: input.accountId,
        },
        update: {},
      });
      return { ok: true as const };
    }),

  remove: protectedProcedure
    .input(z.object({ accountId: AccountIdSchema }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.blocklist.deleteMany({
        where: {
          blockerAccountId: ctx.account.id,
          blockedAccountId: input.accountId,
        },
      });
      return { ok: true as const };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // Returns the blocked accounts with their primary profile display fields
    // for rendering in Settings → Blocked accounts. Oldest blocks first so
    // the list ordering is stable across refetches.
    const rows = await ctx.prisma.blocklist.findMany({
      where: { blockerAccountId: ctx.account.id },
      orderBy: { createdAt: "asc" },
      select: {
        blockedAccountId: true,
        createdAt: true,
        blocked: {
          select: {
            id: true,
            profiles: {
              orderBy: { createdAt: "asc" },
              take: 1,
              select: {
                profile: { select: { handle: true, displayName: true } },
              },
            },
          },
        },
      },
    });
    return {
      blocks: rows.map((r) => ({
        accountId: r.blockedAccountId,
        blockedAt: r.createdAt.toISOString(),
        handle: r.blocked.profiles[0]?.profile.handle ?? null,
        displayName: r.blocked.profiles[0]?.profile.displayName ?? null,
      })),
    };
  }),

  isBlocked: protectedProcedure
    .input(z.object({ accountId: AccountIdSchema }))
    .query(async ({ ctx, input }) => {
      // Symmetric check — either direction counts as blocked for UX gating
      // (we hide both "you blocked them" and "they blocked you").
      const row = await ctx.prisma.blocklist.findFirst({
        where: {
          OR: [
            {
              blockerAccountId: ctx.account.id,
              blockedAccountId: input.accountId,
            },
            {
              blockerAccountId: input.accountId,
              blockedAccountId: ctx.account.id,
            },
          ],
        },
        select: { blockerAccountId: true },
      });
      if (!row) return { blocked: false as const };
      return {
        blocked: true as const,
        direction:
          row.blockerAccountId === ctx.account.id
            ? ("youBlockedThem" as const)
            : ("theyBlockedYou" as const),
      };
    }),
});
