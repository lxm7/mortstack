import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  generateTokenPair,
  verifySuiWalletSignature,
  generateNonce,
  hashPassword,
  comparePassword,
} from '@repo/auth';
import { TRPCError } from '@trpc/server';

// In-memory nonce store (use Redis in production)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

export const authRouter = router({
  // Get nonce for wallet sign-in
  getNonce: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const nonce = generateNonce();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      nonceStore.set(input.walletAddress, { nonce, expiresAt });

      // Clean up expired nonces
      for (const [addr, data] of nonceStore.entries()) {
        if (data.expiresAt < Date.now()) {
          nonceStore.delete(addr);
        }
      }

      return { nonce };
    }),

  // Sign in with SUI wallet
  signInWithWallet: publicProcedure
    .input(
      z.object({
        walletAddress: z.string(),
        signature: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify signature
      const isValid = await verifySuiWalletSignature({
        signature: input.signature,
        message: input.message,
        address: input.walletAddress,
      });

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid wallet signature',
        });
      }

      // Verify nonce
      const storedNonce = nonceStore.get(input.walletAddress);
      if (!storedNonce || !input.message.includes(storedNonce.nonce)) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired nonce',
        });
      }

      if (storedNonce.expiresAt < Date.now()) {
        nonceStore.delete(input.walletAddress);
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Nonce expired',
        });
      }

      // Clear nonce after use
      nonceStore.delete(input.walletAddress);

      // Find or create user
      let user = await ctx.prisma.user.findUnique({
        where: { walletAddress: input.walletAddress },
      });

      if (!user) {
        // Create new user
        user = await ctx.prisma.user.create({
          data: {
            walletAddress: input.walletAddress,
            username: `user_${input.walletAddress.slice(0, 8)}`,
          },
        });
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        walletAddress: user.walletAddress!,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          avatar: user.avatar,
        },
        ...tokens,
      };
    }),

  // Traditional email/password sign up (optional)
  signUp: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(30),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user exists
      const existing = await ctx.prisma.user.findFirst({
        where: {
          OR: [{ username: input.username }, { email: input.email }],
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Username or email already taken',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          username: input.username,
          email: input.email,
          passwordHash,
        },
      });

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        ...tokens,
      };
    }),

  // Traditional sign in
  signIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const isValid = await comparePassword(input.password, user.passwordHash);

      if (!isValid) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        });
      }

      const tokens = generateTokenPair({
        userId: user.id,
      });

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        ...tokens,
      };
    }),
});
