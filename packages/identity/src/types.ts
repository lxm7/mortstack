import type { IdentityTier } from "@repo/database";

// Content permission map - what each tier can do
export const TIER_PERMISSIONS: Record<
  IdentityTier,
  {
    canPostText: boolean;
    canPostImage: boolean;
    canUploadAudio: boolean;
    canUploadVideo: boolean;
  }
> = {
  NONE: {
    canPostText: true,
    canPostImage: false,
    canUploadAudio: false,
    canUploadVideo: false,
  },
  BASIC: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: false,
    canUploadVideo: false,
  },
  CREATOR: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: true,
    canUploadVideo: true,
  },
  ARTIST: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: true,
    canUploadVideo: true,
  },
};

// Helper to check if a given tier has a specific permission
export function hasPermission(
  tier: IdentityTier,
  permission: keyof typeof TIER_PERMISSIONS.NONE,
): boolean {
  return TIER_PERMISSIONS[tier]![permission];
}
