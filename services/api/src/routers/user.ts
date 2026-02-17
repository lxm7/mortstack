import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // Get user profile
  getProfile: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        username: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.userId && !input.username) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'userId or username required',
        });
      }

      const user = await ctx.prisma.user.findFirst({
        where: input.userId
          ? { id: input.userId }
          : { username: input.username },
        select: {
          id: true,
          username: true,
          bio: true,
          avatar: true,
          walletAddress: true,
          isVerified: true,
          reputation: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              follows: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return user;
    }),

  // Update own profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if username is taken
      if (input.username) {
        const existing = await ctx.prisma.user.findFirst({
          where: {
            username: input.username,
            NOT: { id: ctx.user.id },
          },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username already taken',
          });
        }
      }

      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
        select: {
          id: true,
          username: true,
          bio: true,
          avatar: true,
        },
      });

      return user;
    }),

  // Follow user
  follow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot follow yourself',
        });
      }

      const existing = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.user.id,
            followingId: input.userId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already following' });
      }

      await ctx.prisma.follow.create({
        data: {
          followerId: ctx.user.id,
          followingId: input.userId,
        },
      });

      return { success: true };
    }),

  // Unfollow user
  unfollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.follow.deleteMany({
        where: {
          followerId: ctx.user.id,
          followingId: input.userId,
        },
      });

      return { success: true };
    }),
});
