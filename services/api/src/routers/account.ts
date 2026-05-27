import { router, protectedProcedure } from "../trpc";

// Surface the resolved Account on the authenticated context. Lets clients
// learn their own accountId without making a separate Prisma query — used by
// the M3 acceptance harness in apps/mobile/app/chat-db-debug.tsx and any
// future UI that needs the canonical Account.id for chat routing.
export const accountRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    // Primary Profile = oldest OWNER membership. Phase 1 is single-Profile
    // per Account in practice; the join is here so the multi-persona
    // milestone doesn't have to touch this endpoint.
    const primary = await ctx.prisma.profileMember.findFirst({
      where: { accountId: ctx.account.id, role: "OWNER" },
      orderBy: { profile: { createdAt: "asc" } },
      select: { profile: { select: { displayName: true } } },
    });
    return {
      accountId: ctx.account.id,
      identityTier: ctx.account.identityTier,
      displayName: primary?.profile.displayName ?? null,
    };
  }),
});
