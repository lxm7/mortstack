import { initTRPC, TRPCError } from '@trpc/server';
import { prisma, type IdentityTier, type ProfileType, type ProfileRole } from '@repo/database';
import { verifyAccessToken } from '@repo/auth';
import { hasPermission } from '@repo/identity';

export interface Context {
  prisma: typeof prisma;
  // The authenticated real-world person
  account: {
    id: string;
    identityTier: IdentityTier;
    isBanned: boolean;
  } | null;
  // The profile they're acting as this request (from X-Profile-Id header)
  activeProfile: {
    id: string;
    type: ProfileType;
    role: ProfileRole;
  } | null;
}

// Shared context resolution — used by both Lambda and standalone server adapters
export async function resolveContext(headers: {
  authorization?: string;
  'x-profile-id'?: string;
}): Promise<Context> {
  const authHeader = headers.authorization;
  let account: Context['account'] = null;
  let activeProfile: Context['activeProfile'] = null;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(authHeader.substring(7));
      const dbAccount = await prisma.account.findUnique({
        where: { id: payload.accountId },
        select: { id: true, identityTier: true, isBanned: true },
      });

      if (dbAccount) {
        account = dbAccount;

        // Resolve active profile from header — validate membership
        const profileId = headers['x-profile-id'];
        if (profileId) {
          const membership = await prisma.profileMember.findUnique({
            where: { accountId_profileId: { accountId: dbAccount.id, profileId } },
            select: {
              role: true,
              profile: { select: { id: true, type: true } },
            },
          });

          if (membership) {
            activeProfile = {
              id: membership.profile.id,
              type: membership.profile.type,
              role: membership.role,
            };
          }
        }
      }
    } catch {
      // Invalid token — proceed without account
    }
  }

  return { prisma, account, activeProfile };
}

// Lambda adapter context creator
export async function createContext({
  event,
}: {
  event: { headers: Record<string, string | undefined> };
}): Promise<Context> {
  return resolveContext({
    authorization: event.headers.authorization ?? event.headers.Authorization,
    'x-profile-id': event.headers['x-profile-id'],
  });
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

// Requires a valid, non-banned account
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.account) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  if (ctx.account.isBanned) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is banned' });
  }
  return next({ ctx: { ...ctx, account: ctx.account } });
});

// Requires account + an active profile from X-Profile-Id header
export const profileProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.activeProfile) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'X-Profile-Id header required — select a profile to act as',
    });
  }
  return next({ ctx: { ...ctx, activeProfile: ctx.activeProfile } });
});

// Identity-gated procedure — requires profileProcedure + tier check
export function tierProcedure(permission: Parameters<typeof hasPermission>[1]) {
  return profileProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.account.identityTier, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Account verification required for this action (${permission})`,
        cause: { requiredPermission: permission, currentTier: ctx.account.identityTier },
      });
    }
    return next({ ctx });
  });
}
