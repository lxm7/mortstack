import { createAuthEndpoint } from 'better-auth/api'
import { APIError } from 'better-auth'
import { z } from 'zod'
import { verifyPersonalMessageSignature } from '@mysten/sui/verify'
import { prisma } from '@repo/database'
import crypto from 'node:crypto'

// ── SUI Wallet Auth Plugin ────────────────────────────────────────────────────
// Implements challenge-response wallet authentication on top of Better Auth.
// Flow:
//   1. POST /auth/sui/get-nonce   → server generates nonce, stores in verification table
//   2. POST /auth/sui/verify      → server verifies signature, creates/finds user + session
//
// The nonce is stored in Better Auth's `verification` table (identifier = walletAddress).
// Session is created via Better Auth's internalAdapter — fully DB-backed and revocable.

export const suiWalletPlugin = () => {
  return {
    id: 'sui-wallet' as const,
    endpoints: {
      suiGetNonce: createAuthEndpoint(
        '/sui/get-nonce',
        {
          method: 'POST',
          body: z.object({ walletAddress: z.string().min(1) }),
          metadata: { isAction: true },
        },
        async (ctx) => {
          const { walletAddress } = ctx.body
          const nonce = crypto.randomBytes(16).toString('hex')
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 min

          // Upsert nonce into verification table
          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `sui:${walletAddress}`,
            value: nonce,
            expiresAt,
          })

          return ctx.json({ nonce })
        },
      ),

      suiVerify: createAuthEndpoint(
        '/sui/verify',
        {
          method: 'POST',
          body: z.object({
            walletAddress: z.string().min(1),
            signature: z.string().min(1),
            message: z.string().min(1),
          }),
          metadata: { isAction: true },
        },
        async (ctx) => {
          const { walletAddress, signature, message } = ctx.body

          // 1. Look up and validate nonce
          const verification = await ctx.context.internalAdapter.findVerificationValue(
            `sui:${walletAddress}`,
          )

          if (!verification) {
            throw new APIError('UNAUTHORIZED', { message: 'No nonce found — request a new one' })
          }
          if (verification.expiresAt < new Date()) {
            await ctx.context.internalAdapter.deleteVerificationValue(verification.id)
            throw new APIError('UNAUTHORIZED', { message: 'Nonce expired' })
          }
          if (!message.includes(verification.value)) {
            throw new APIError('UNAUTHORIZED', { message: 'Nonce mismatch' })
          }

          // 2. Verify SUI signature
          const isValid = await verifySuiSignature({ walletAddress, signature, message })
          if (!isValid) {
            throw new APIError('UNAUTHORIZED', { message: 'Invalid wallet signature' })
          }

          // 3. Consume nonce
          await ctx.context.internalAdapter.deleteVerificationValue(verification.id)

          // 4. Find or create Better Auth user (keyed by a synthetic email for wallet)
          // Using synthetic email avoids adding walletAddress to Better Auth's user schema.
          // The real walletAddress lives on the domain Account model.
          const syntheticEmail = `${walletAddress}@sui.wallet`

          let user = await ctx.context.internalAdapter.findUserByEmail(syntheticEmail)

          if (!user) {
            user = await ctx.context.internalAdapter.createUser({
              email: syntheticEmail,
              name: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
              emailVerified: true, // Wallet ownership = verified identity
              createdAt: new Date(),
              updatedAt: new Date(),
            })

            // Create the domain Account linked to this Better Auth user
            await prisma.account.upsert({
              where: { walletAddress },
              update: { authUserId: user.id },
              create: {
                authUserId: user.id,
                walletAddress,
              },
            })
          }

          // 5. Create DB-backed session (revocable on logout/ban)
          const session = await ctx.context.internalAdapter.createSession(
            user.id,
            ctx.request,
          )

          return ctx.json({
            token: session.token,
            session: {
              id: session.id,
              expiresAt: session.expiresAt,
              user: {
                id: user.id,
                name: user.name,
                email: syntheticEmail,
                emailVerified: user.emailVerified,
              },
            },
          })
        },
      ),
    },
  }
}

// ── Signature verification ────────────────────────────────────────────────────
async function verifySuiSignature({
  walletAddress,
  signature,
  message,
}: {
  walletAddress: string
  signature: string
  message: string
}): Promise<boolean> {
  try {
    // @mysten/sui verifyPersonalMessageSignature returns the public key on success
    // and throws on failure — so we catch and return false
    const messageBytes = new TextEncoder().encode(message)
    const publicKey = await verifyPersonalMessageSignature(messageBytes, signature)
    return publicKey.toSuiAddress() === walletAddress
  } catch {
    return false
  }
}
