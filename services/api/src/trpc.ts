import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateAWSLambdaContextOptions } from '@trpc/server/adapters/aws-lambda';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { prisma, type IdentityTier } from '@repo/database';
import { verifyAccessToken } from '@repo/auth';
import { hasPermission } from '@repo/identity';

// Context type
export interface Context {
  prisma: typeof prisma;
  user: {
    id: string;
    walletAddress?: string;
    identityTier: IdentityTier;
  } | null;
}

// Create context from Lambda event
export async function createContext({
  event,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>): Promise<Context> {
  const authHeader = event.headers.authorization || event.headers.Authorization;

  let user: Context['user'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = verifyAccessToken(token);
      // Fetch identity tier from DB - needed for permission checks downstream
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { identityTier: true },
      });
      user = {
        id: payload.userId,
        walletAddress: payload.walletAddress,
        identityTier: dbUser?.identityTier ?? 'NONE',
      };
    } catch (error) {
      // Invalid token, proceed without user
      console.warn('Invalid token:', error);
    }
  }

  return {
    prisma,
    user,
  };
}

// Initialize tRPC
const t = initTRPC.context<Context>().create();

// Export router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Authenticated procedure (requires valid JWT)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  return next({
    ctx: { ...ctx, user: ctx.user },
  });
});

// Identity-gated procedure factory
// Usage: tierProcedure('canUploadVideo') - throws if user lacks that permission
export function tierProcedure(permission: Parameters<typeof hasPermission>[1]) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!hasPermission(ctx.user!.identityTier, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Your account needs verification to perform this action. Required permission: ${permission}`,
        cause: { requiredPermission: permission, currentTier: ctx.user!.identityTier },
      });
    }
    return next({ ctx });
  });
}
