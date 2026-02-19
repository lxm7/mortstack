import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const postRouter = router({
  // Get feed (paginated)
  getFeed: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { isHidden: false },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return {
        posts,
        nextCursor,
      };
    }),

  // Get single post
  getPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.postId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isVerified: true,
            },
          },
          comments: {
            where: { isHidden: false },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!post || post.isHidden) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
    }),

  // Create post - media types are gated by identity tier
  // TEXT: any authenticated user
  // IMAGE: BASIC tier+
  // AUDIO/VIDEO/PERFORMANCE: CREATOR tier+
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(5000),
        mediaUrls: z.array(z.string().url()).max(10).optional(),
        mediaType: z.enum(["TEXT", "IMAGE", "VIDEO", "AUDIO", "PERFORMANCE"]),
      }),
    )
    .use(async ({ ctx, input, next }) => {
      // Check permission based on media type
      const permissionMap = {
        TEXT: null, // No extra permission needed
        IMAGE: "canPostImage",
        AUDIO: "canUploadAudio",
        VIDEO: "canUploadVideo",
        PERFORMANCE: "canUploadVideo", // Performance requires same level as video
      } as const;

      const required = permissionMap[input.mediaType];
      if (required) {
        const { hasPermission } = await import("@repo/identity");
        if (!hasPermission(ctx.user.identityTier, required)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Uploading ${input.mediaType.toLowerCase()} content requires account verification. Visit your profile to verify.`,
            cause: {
              requiredPermission: required,
              currentTier: ctx.user.identityTier,
            },
          });
        }
      }
      return next({ ctx });
    })
    .mutation(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.create({
        data: {
          userId: ctx.user.id,
          content: input.content,
          mediaUrls: input.mediaUrls || [],
          mediaType: input.mediaType,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      return post;
    }),

  // Like post
  like: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if already liked
      const existing = await ctx.prisma.like.findUnique({
        where: {
          postId_userId: {
            postId: input.postId,
            userId: ctx.user.id,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already liked",
        });
      }

      // Create like and increment counter
      await ctx.prisma.$transaction([
        ctx.prisma.like.create({
          data: {
            postId: input.postId,
            userId: ctx.user.id,
          },
        }),
        ctx.prisma.post.update({
          where: { id: input.postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);

      return { success: true };
    }),

  // Unlike post
  unlike: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.$transaction([
        ctx.prisma.like.deleteMany({
          where: {
            postId: input.postId,
            userId: ctx.user.id,
          },
        }),
        ctx.prisma.post.update({
          where: { id: input.postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);

      return { success: true };
    }),

  // Search posts by content or username
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          isHidden: false,
          OR: [
            { content: { contains: input.query, mode: "insensitive" } },
            {
              user: {
                username: { contains: input.query, mode: "insensitive" },
              },
            },
          ],
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          mediaUrls: true,
          mediaType: true,
          createdAt: true,
          likesCount: true,
          commentsCount: true,
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > input.limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem?.id;
      }

      return { posts, nextCursor };
    }),

  // Comment on post
  comment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          postId: input.postId,
          userId: ctx.user.id,
          content: input.content,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      // Increment comment count
      await ctx.prisma.post.update({
        where: { id: input.postId },
        data: { commentsCount: { increment: 1 } },
      });

      return comment;
    }),
});
