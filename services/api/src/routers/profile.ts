import { z } from "zod";
import {
  router,
  publicProcedure,
  protectedProcedure,
  profileProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { ProfileSchema, MyProfileSchema } from "@repo/schemas";

const ProfileTypeSchema = z.enum([
  "MUSICIAN",
  "VENUE",
  "PROMOTER",
  "VISUAL_ARTIST",
  "BAND",
]);

export const profileRouter = router({
  // ── Create a new profile (requires account, not an active profile) ────────────

  create: protectedProcedure
    .input(
      z.object({
        handle: z
          .string()
          .min(2)
          .max(30)
          .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
        displayName: z.string().min(1).max(80),
        type: ProfileTypeSchema,
        bio: z.string().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.profile.findUnique({
        where: { handle: input.handle },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Handle already taken",
        });
      }

      const profile = await ctx.prisma.profile.create({
        data: {
          handle: input.handle,
          displayName: input.displayName,
          type: input.type,
          bio: input.bio,
          members: {
            create: { accountId: ctx.account.id, role: "OWNER" },
          },
        },
        select: {
          id: true,
          handle: true,
          displayName: true,
          type: true,
          bio: true,
          avatar: true,
          isVerified: true,
          createdAt: true,
        },
      });

      return profile;
    }),

  // ── Get a profile by handle (public) ──────────────────────────────────────────

  get: publicProcedure
    .input(z.object({ handle: z.string() }))
    .output(ProfileSchema)
    .query(async ({ input, ctx }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { handle: input.handle },
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true,
          avatar: true,
          type: true,
          isVerified: true,
          isBanned: true,
          reputation: true,
          createdAt: true,
          _count: {
            select: { posts: true, followers: true, follows: true },
          },
        },
      });

      if (!profile || profile.isBanned) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      return profile;
    }),

  // ── List profiles for the authenticated account ───────────────────────────────

  listMine: protectedProcedure
    .output(z.array(MyProfileSchema))
    .query(async ({ ctx }) => {
      const memberships = await ctx.prisma.profileMember.findMany({
        where: { accountId: ctx.account.id },
        select: {
          role: true,
          profile: {
            select: {
              id: true,
              handle: true,
              displayName: true,
              avatar: true,
              type: true,
              isVerified: true,
            },
          },
        },
      });

      return memberships.map(({ profile, role }) => ({ ...profile, role }));
    }),

  // ── Update active profile ─────────────────────────────────────────────────────

  update: profileProcedure
    .input(
      z.object({
        displayName: z.string().min(1).max(80).optional(),
        bio: z.string().max(500).optional(),
        avatar: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // Only OWNER or ADMIN can update profile details
      if (ctx.activeProfile.role === "MEMBER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Members cannot edit profile details",
        });
      }

      return ctx.prisma.profile.update({
        where: { id: ctx.activeProfile.id },
        data: input,
        select: {
          id: true,
          handle: true,
          displayName: true,
          bio: true,
          avatar: true,
        },
      });
    }),

  // ── Follow / unfollow (Profile → Profile) ────────────────────────────────────

  follow: profileProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (input.profileId === ctx.activeProfile.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot follow yourself",
        });
      }

      const target = await ctx.prisma.profile.findUnique({
        where: { id: input.profileId },
        select: { id: true, isBanned: true },
      });

      if (!target || target.isBanned) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profile not found",
        });
      }

      const existing = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: ctx.activeProfile.id,
            followingId: input.profileId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Already following" });
      }

      await ctx.prisma.follow.create({
        data: {
          followerId: ctx.activeProfile.id,
          followingId: input.profileId,
        },
      });

      return { success: true };
    }),

  unfollow: profileProcedure
    .input(z.object({ profileId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.follow.deleteMany({
        where: {
          followerId: ctx.activeProfile.id,
          followingId: input.profileId,
        },
      });

      return { success: true };
    }),

  // ── Band membership management ────────────────────────────────────────────────

  addMember: profileProcedure
    .input(
      z.object({ accountId: z.string(), role: z.enum(["ADMIN", "MEMBER"]) }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.activeProfile.role !== "OWNER") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can add members",
        });
      }

      const existing = await ctx.prisma.profileMember.findUnique({
        where: {
          accountId_profileId: {
            accountId: input.accountId,
            profileId: ctx.activeProfile.id,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Account is already a member",
        });
      }

      await ctx.prisma.profileMember.create({
        data: {
          accountId: input.accountId,
          profileId: ctx.activeProfile.id,
          role: input.role,
        },
      });

      return { success: true };
    }),
});
