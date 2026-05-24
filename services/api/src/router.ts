import { router } from "./trpc";
import { profileRouter } from "./routers/profile";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { accountRouter } from "./routers/account";
import { mlsRouter } from "./routers/mls";

// Auth is handled by Better Auth at /auth/* (not tRPC).
// See services/api/src/lib/auth.ts
export const appRouter = router({
  profile: profileRouter,
  post: postRouter,
  user: userRouter,
  account: accountRouter,
  mls: mlsRouter,
});

export type AppRouter = typeof appRouter;
