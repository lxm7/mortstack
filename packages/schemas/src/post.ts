import { z } from 'zod';
import { MediaTypeSchema } from './enums.js';
import { ProfileSummarySchema } from './profile.js';

export const CommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  profile: ProfileSummarySchema,
});

// Used in feeds and lists — no comments array (loaded separately)
export const FeedPostSchema = z.object({
  id: z.string(),
  content: z.string(),
  mediaUrls: z.array(z.string()),
  mediaType: MediaTypeSchema,
  createdAt: z.coerce.date(),
  likesCount: z.number(),
  commentsCount: z.number(),
  profile: ProfileSummarySchema,
});

// Full post detail — includes initial comment page
export const PostSchema = FeedPostSchema.extend({
  updatedAt: z.coerce.date(),
  comments: z.array(CommentSchema),
});

export const FeedSchema = z.object({
  posts: z.array(FeedPostSchema),
  nextCursor: z.string().optional(),
});

export type Comment = z.infer<typeof CommentSchema>;
export type FeedPost = z.infer<typeof FeedPostSchema>;
export type Post = z.infer<typeof PostSchema>;
export type Feed = z.infer<typeof FeedSchema>;
