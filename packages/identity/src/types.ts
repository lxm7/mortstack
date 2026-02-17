import type { IdentityTier } from '@repo/database';

// Core result shape all providers must return
export interface IdentityCheckResult {
  externalId: string;       // Provider's reference ID (store in IdentityCheck.externalId)
  status: 'approved' | 'rejected' | 'pending';
  tier: IdentityTier;
  expiresAt?: Date;
  providerPayload?: Record<string, unknown>; // Raw provider response for audit
}

// Initiation result - some providers return a URL to redirect the user to
export interface IdentityCheckInit {
  externalId: string;
  redirectUrl?: string;     // Present for redirect-based flows (World ID, Gitcoin)
  clientToken?: string;     // Present for embedded flows (phone OTP)
}

// The interface every provider must implement
// Adding a new provider = implement this interface, register it below
export interface IdentityProvider {
  readonly name: string;
  readonly tier: IdentityTier; // What tier does this provider grant?

  /**
   * Start a verification session.
   * For phone: sends OTP. For World ID: returns redirect URL. For stake: records intent.
   */
  initiate(userId: string, metadata?: Record<string, unknown>): Promise<IdentityCheckInit>;

  /**
   * Complete or verify the check.
   * For phone: verify OTP code. For World ID: verify ZK proof. For OAuth: verify callback.
   */
  verify(externalId: string, proof: unknown): Promise<IdentityCheckResult>;

  /**
   * Check the status of an existing session (for async providers like stake).
   */
  getStatus(externalId: string): Promise<IdentityCheckResult>;
}

// Content permission map - what each tier can do
export const TIER_PERMISSIONS: Record<IdentityTier, {
  canPostText: boolean;
  canPostImage: boolean;
  canUploadAudio: boolean;
  canUploadVideo: boolean;
  canMintNFT: boolean;
}> = {
  NONE: {
    canPostText: true,
    canPostImage: false,
    canUploadAudio: false,
    canUploadVideo: false,
    canMintNFT: false,
  },
  BASIC: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: false,
    canUploadVideo: false,
    canMintNFT: false,
  },
  CREATOR: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: true,
    canUploadVideo: true,
    canMintNFT: false,
  },
  ARTIST: {
    canPostText: true,
    canPostImage: true,
    canUploadAudio: true,
    canUploadVideo: true,
    canMintNFT: true,
  },
};

// Helper to check if a given tier has a specific permission
export function hasPermission(
  tier: IdentityTier,
  permission: keyof typeof TIER_PERMISSIONS.NONE
): boolean {
  return TIER_PERMISSIONS[tier][permission];
}
