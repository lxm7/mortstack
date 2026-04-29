import { router } from "./trpc";
import { profileRouter } from "./routers/profile";
import { postRouter } from "./routers/post";

// Auth is handled by Better Auth at /auth/* (not tRPC).
// See services/api/src/lib/auth.ts
export const appRouter = router({
  profile: profileRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
