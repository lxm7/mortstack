import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';

// R2 is S3-compatible - use the standard AWS SDK with R2 credentials
const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: Resource.CloudflareR2AccessKeyId.value,
    secretAccessKey: Resource.CloudflareR2SecretAccessKey.value,
  },
});

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
};

const MAX_SIZES: Record<string, number> = {
  image: 10 * 1024 * 1024,  // 10MB
  audio: 50 * 1024 * 1024,  // 50MB
  video: 500 * 1024 * 1024, // 500MB
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { contentType, fileName, userId } = body;

    if (!contentType || !ALLOWED_TYPES[contentType]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unsupported content type: ${contentType}` }),
      };
    }

    const mediaType = contentType.split('/')[0]; // 'image', 'audio', 'video'
    const ext = ALLOWED_TYPES[contentType];
    const key = `uploads/${userId}/${Date.now()}-${fileName ?? 'file'}.${ext}`;

    // Generate presigned URL - valid for 5 minutes
    const url = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: Resource.Media.name,
        Key: key,
        ContentType: contentType,
        ContentLength: MAX_SIZES[mediaType],
      }),
      { expiresIn: 300 }
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadUrl: url,
        key,
        // Client uses this to reference the uploaded file in post.create
        mediaUrl: `${process.env.CDN_URL}/${key}`,
      }),
    };
  } catch (error) {
    console.error('Upload URL generation failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate upload URL' }),
    };
  }
};
