import { router } from "./trpc";
import { profileRouter } from "./routers/profile";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { accountRouter } from "./routers/account";
import { mlsRouter } from "./routers/mls";
import { chatRouter } from "./routers/chat";
import { blocksRouter } from "./routers/blocks";
import { reportsRouter } from "./routers/reports";

// Auth is handled by Better Auth at /auth/* (not tRPC).
// See services/api/src/lib/auth.ts
export const appRouter = router({
  profile: profileRouter,
  post: postRouter,
  user: userRouter,
  account: accountRouter,
  mls: mlsRouter,
  chat: chatRouter,
  blocks: blocksRouter,
  reports: reportsRouter,
});

export type AppRouter = typeof appRouter;
