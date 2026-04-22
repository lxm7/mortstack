import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { AuthResponseSchema, TokensSchema } from '@repo/schemas';
import {
  generateTokenPair,
  verifySuiWalletSignature,
  generateNonce,
  hashPassword,
  comparePassword,
} from '@repo/auth';
import { TRPCError } from '@trpc/server';

// In-memory nonce store — replace with Upstash Redis in staging/production
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

// Shared profile shape returned after any successful auth
const profileSelect = {
  id: true,
  handle: true,
  displayName: true,
  avatar: true,
  type: true,
  isVerified: true,
} as const;

// Builds the auth response shape: tokens + account + their profiles
async function buildAuthResponse(
  prisma: Parameters<Parameters<typeof protectedProcedure.mutation>[0]>[0]['ctx']['prisma'],
  accountId: string,
  tokens: { accessToken: string; refreshToken: string },
) {
  const account = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: {
      id: true,
      email: true,
      walletAddress: true,
      identityTier: true,
      profiles: {
        select: {
          profile: { select: profileSelect },
          role: true,
        },
      },
    },
  });

  return {
    ...tokens,
    account: {
      id: account.id,
      email: account.email,
      walletAddress: account.walletAddress,
      identityTier: account.identityTier,
    },
    // Client picks one to set as X-Profile-Id header, or navigates to profile creation
    profiles: account.profiles.map(({ profile, role }) => ({
      id: profile.id,
      handle: profile.handle,
      displayName: profile.displayName,
      avatar: profile.avatar,
      type: profile.type,
      isVerified: profile.isVerified,
      role,
    })),
  };
}

export const authRouter = router({
  // ── Wallet auth ─────────────────────────────────────────────────────────────

  getNonce: publicProcedure
    .input(z.object({ walletAddress: z.string() }))
    .mutation(({ input }) => {
      const nonce = generateNonce();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

      nonceStore.set(input.walletAddress, { nonce, expiresAt });

      // Prune expired entries
      for (const [addr, data] of nonceStore.entries()) {
        if (data.expiresAt < Date.now()) nonceStore.delete(addr);
      }

      return { nonce };
    }),

  signInWithWallet: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        signature: z.string(),
        message: z.string(),
      }),
    )
    .output(AuthResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const isValid = await verifySuiWalletSignature({
        signature: input.signature,
        message: input.message,
        address: input.walletAddress,
      });

      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid wallet signature' });
      }

      const storedNonce = nonceStore.get(input.walletAddress);
      if (!storedNonce || storedNonce.expiresAt < Date.now()) {
        nonceStore.delete(input.walletAddress);
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired nonce' });
      }
      if (!input.message.includes(storedNonce.nonce)) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Nonce mismatch' });
      }
      nonceStore.delete(input.walletAddress);

      // Find or create Account — wallet auth always succeeds for new addresses
      let account = await ctx.prisma.account.findUnique({
        where: { walletAddress: input.walletAddress },
        select: { id: true },
      });

      if (!account) {
        account = await ctx.prisma.account.create({
          data: { walletAddress: input.walletAddress },
          select: { id: true },
        });
      }

      const tokens = generateTokenPair({ accountId: account.id });
      return buildAuthResponse(ctx.prisma, account.id, tokens);
    }),

  // ── Email/password auth ──────────────────────────────────────────────────────

  signUp: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    )
    .output(AuthResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.account.findUnique({
        where: { email: input.email },
        select: { id: true },
      });

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already registered' });
      }

      const passwordHash = await hashPassword(input.password);
      const account = await ctx.prisma.account.create({
        data: { email: input.email, passwordHash },
        select: { id: true },
      });

      const tokens = generateTokenPair({ accountId: account.id });
      return buildAuthResponse(ctx.prisma, account.id, tokens);
    }),

  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .output(AuthResponseSchema)
    .mutation(async ({ input, ctx }) => {
      const account = await ctx.prisma.account.findUnique({
        where: { email: input.email },
        select: { id: true, passwordHash: true },
      });

      if (!account?.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const isValid = await comparePassword(input.password, account.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const tokens = generateTokenPair({ accountId: account.id });
      return buildAuthResponse(ctx.prisma, account.id, tokens);
    }),

  // ── Link wallet to existing account ──────────────────────────────────────────
  // Called after sign-up when user later connects their SUI wallet

  linkWallet: protectedProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        signature: z.string(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const isValid = await verifySuiWalletSignature({
        signature: input.signature,
        message: input.message,
        address: input.walletAddress,
      });

      if (!isValid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid wallet signature' });
      }

      const conflict = await ctx.prisma.account.findUnique({
        where: { walletAddress: input.walletAddress },
        select: { id: true },
      });

      if (conflict && conflict.id !== ctx.account.id) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Wallet already linked to another account',
        });
      }

      await ctx.prisma.account.update({
        where: { id: ctx.account.id },
        data: { walletAddress: input.walletAddress },
      });

      return { success: true };
    }),

  // ── Token refresh ────────────────────────────────────────────────────────────

  refresh: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .output(TokensSchema)
    .mutation(async ({ input, ctx }) => {
      const { verifyRefreshToken } = await import('@repo/auth');
      try {
        const payload = verifyRefreshToken(input.refreshToken);
        const account = await ctx.prisma.account.findUnique({
          where: { id: payload.accountId },
          select: { id: true, isBanned: true },
        });

        if (!account || account.isBanned) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Account not found or banned' });
        }

        const tokens = generateTokenPair({ accountId: account.id });
        return tokens;
      } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
      }
    }),
});
