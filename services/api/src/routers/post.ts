import { z } from 'zod';
import { router, publicProcedure, profileProcedure, tierProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { FeedSchema, PostSchema, FeedPostSchema, CommentSchema } from '@repo/schemas';

const profileSelect = {
  id: true,
  handle: true,
  displayName: true,
  avatar: true,
  type: true,
  isVerified: true,
} as const;

export const postRouter = router({
  // ── Feed ─────────────────────────────────────────────────────────────────────
  // Authenticated: posts from profiles the active profile follows
  // Unauthenticated: global public feed

  getFeed: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .output(FeedSchema)
    .query(async ({ input, ctx }) => {
      const followedIds =
        ctx.activeProfile
          ? (
              await ctx.prisma.follow.findMany({
                where: { followerId: ctx.activeProfile.id },
                select: { followingId: true },
              })
            ).map((f) => f.followingId)
          : undefined;

      const posts = await ctx.prisma.post.findMany({
        where: {
          isHidden: false,
          ...(followedIds ? { profileId: { in: followedIds } } : {}),
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          profile: { select: profileSelect },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        nextCursor = posts.pop()!.id;
      }

      return { posts, nextCursor };
    }),

  // ── Single post ───────────────────────────────────────────────────────────────

  getPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .output(PostSchema)
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          updatedAt: true,
          likesCount: true,
          commentsCount: true,
          isHidden: true,
          profile: { select: profileSelect },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
              id: true,
              content: true,
              createdAt: true,
              profile: { select: profileSelect },
            },
          },
        },
      });

      if (!post || post.isHidden) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      return post;
    }),

  // ── Create post ───────────────────────────────────────────────────────────────
  // Media type determines required identity tier — checked via tierProcedure

  create: tierProcedure('canPostImage') // minimum gate — further check inside
    .input(
      z.object({
        content: z.string().min(1).max(5000),
        mediaUrls: z.array(z.string().url()).max(10).default([]),
        mediaType: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'PERFORMANCE']).default('TEXT'),
      }),
    )
    .use(async ({ ctx, input, next }) => {
      const permissionMap = {
        TEXT: null,
        IMAGE: 'canPostImage',
        AUDIO: 'canUploadAudio',
        VIDEO: 'canUploadVideo',
        PERFORMANCE: 'canUploadVideo',
      } as const;

      const required = permissionMap[input.mediaType];
      if (required) {
        const { hasPermission } = await import('@repo/identity');
        if (!hasPermission(ctx.account.identityTier, required)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: `Uploading ${input.mediaType.toLowerCase()} requires account verification`,
          });
        }
      }

      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.post.create({
        data: {
          profileId: ctx.activeProfile.id,
          content: input.content,
          mediaUrls: input.mediaUrls,
          mediaType: input.mediaType,
        },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          profile: { select: profileSelect },
        },
      });
    }),

  // ── Like / unlike ─────────────────────────────────────────────────────────────

  like: profileProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.like.findUnique({
        where: {
          postId_profileId: { postId: input.postId, profileId: ctx.activeProfile.id },
        },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Already liked' });
      }

      await ctx.prisma.$transaction([
        ctx.prisma.like.create({
          data: { postId: input.postId, profileId: ctx.activeProfile.id },
        }),
        ctx.prisma.post.update({
          where: { id: input.postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      return { success: true };
    }),

  unlike: profileProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.like.deleteMany({
          where: { postId: input.postId, profileId: ctx.activeProfile.id },
        }),
        ctx.prisma.post.update({
          where: { id: input.postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);

      return { success: true };
    }),

  // ── Comment ───────────────────────────────────────────────────────────────────

  comment: profileProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .output(CommentSchema)
    .mutation(async ({ input, ctx }) => {
      const [comment] = await ctx.prisma.$transaction([
        ctx.prisma.comment.create({
          data: {
            postId: input.postId,
            profileId: ctx.activeProfile.id,
            content: input.content,
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            profile: { select: profileSelect },
          },
        }),
        ctx.prisma.post.update({
          where: { id: input.postId },
          data: { commentsCount: { increment: 1 } },
        }),
      ]);

      return comment;
    }),

  // ── Search ────────────────────────────────────────────────────────────────────

  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .output(FeedSchema)
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          isHidden: false,
          OR: [
            { content: { contains: input.query, mode: 'insensitive' } },
            { profile: { displayName: { contains: input.query, mode: 'insensitive' } } },
            { profile: { handle: { contains: input.query, mode: 'insensitive' } } },
          ],
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          profile: { select: profileSelect },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        nextCursor = posts.pop()!.id;
      }

      return { posts, nextCursor };
    }),
});
