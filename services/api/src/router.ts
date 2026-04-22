import { router } from './trpc';
import { authRouter } from './routers/auth';
import { profileRouter } from './routers/profile';
import { postRouter } from './routers/post';

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
