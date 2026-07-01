import { z } from "zod";

export const IdentityTierSchema = z.enum([
  "NONE",
  "BASIC",
  "CREATOR",
  "ARTIST",
]);
export const ProfileTypeSchema = z.enum([
  "MUSICIAN",
  "VENUE",
  "PROMOTER",
  "VISUAL_ARTIST",
  "BAND",
]);
export const ProfileRoleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);
export const MediaTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "PERFORMANCE",
]);

export type IdentityTier = z.infer<typeof IdentityTierSchema>;
export type ProfileType = z.infer<typeof ProfileTypeSchema>;
export type ProfileRole = z.infer<typeof ProfileRoleSchema>;
export type MediaType = z.infer<typeof MediaTypeSchema>;
