import { router, protectedProcedure } from "../trpc";

// Surface the resolved Account on the authenticated context. Lets clients
// learn their own accountId without making a separate Prisma query — used by
// the M3 acceptance harness in apps/mobile/app/chat-db-debug.tsx and any
// future UI that needs the canonical Account.id for chat routing.
export const accountRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return {
      accountId: ctx.account.id,
      identityTier: ctx.account.identityTier,
    };
  }),
});
