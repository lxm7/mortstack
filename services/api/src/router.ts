import { router } from "./trpc";
import { profileRouter } from "./routers/profile";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { accountRouter } from "./routers/account";

// Auth is handled by Better Auth at /auth/* (not tRPC).
// See services/api/src/lib/auth.ts
export const appRouter = router({
  profile: profileRouter,
  post: postRouter,
  user: userRouter,
  account: accountRouter,
});

export type AppRouter = typeof appRouter;
