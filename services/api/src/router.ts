import { router } from './trpc';
import { authRouter } from './routers/auth';
import { userRouter } from './routers/user';
import { postRouter } from './routers/post';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
