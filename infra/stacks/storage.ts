import { cfR2AccessKeyId, cfR2SecretAccessKey } from './secrets';

// ── Cloudflare R2 ────────────────────────────────────────────────────────────
// S3-compatible object storage with ZERO egress fees.
// Critical for a media-heavy social app (audio, video, images, NFT metadata).
//
// Buckets:
//   media    - User-uploaded content (images, audio, video)
//   nft      - NFT metadata JSON + cover images (permanent, public)
//
// Access pattern:
//   Upload:  Lambda generates a presigned URL → client uploads directly to R2
//   Read:    Cloudflare CDN serves content (no Lambda involved)

export const mediaBucket = new sst.cloudflare.Bucket('Media', {
  // In production, add a public custom domain via Cloudflare dashboard
  // e.g. media.yourdomain.com → R2 bucket
});

export const nftMetadataBucket = new sst.cloudflare.Bucket('NftMetadata', {
  // NFT metadata must be permanently accessible for on-chain references
  // Consider enabling object versioning for immutability
});

// ── CDN URL ──────────────────────────────────────────────────────────────────
// In production this will be your custom domain (media.yourdomain.com)
// For now, expose the R2 public URL as an output
export const cdnUrl = $interpolate`https://${mediaBucket.name}.r2.dev`;

// ── Presigned URL helper config ──────────────────────────────────────────────
// Your Lambda will use these credentials to generate R2 presigned URLs
// R2 is S3-compatible, so the standard AWS SDK works with these credentials
export const r2Config = {
  // Accessed in Lambda via Resource.CloudflareR2AccessKeyId.value etc.
  accessKeyId: cfR2AccessKeyId,
  secretAccessKey: cfR2SecretAccessKey,
  // R2 endpoint format: https://<accountId>.r2.cloudflarestorage.com
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: 'auto',
};

export const storage = {
  mediaBucket,
  nftMetadataBucket,
  cdnUrl,
};
