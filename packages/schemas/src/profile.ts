import { z } from 'zod';
import { ProfileTypeSchema, ProfileRoleSchema } from './enums.js';

// Embedded in posts, comments, search results — the minimum needed to render attribution
export const ProfileSummarySchema = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  avatar: z.string().nullable(),
  type: ProfileTypeSchema,
  isVerified: z.boolean(),
});

// Full profile page
export const ProfileSchema = ProfileSummarySchema.extend({
  bio: z.string().nullable(),
  reputation: z.number(),
  createdAt: z.coerce.date(),
  _count: z.object({
    posts: z.number(),
    followers: z.number(),
    follows: z.number(),
  }),
});

// The authenticated account's own profile list — includes their role
export const MyProfileSchema = ProfileSummarySchema.extend({
  role: ProfileRoleSchema,
});

export type ProfileSummary = z.infer<typeof ProfileSummarySchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type MyProfile = z.infer<typeof MyProfileSchema>;
