import { createAuthClient } from 'better-auth/client'
import { loadSessionToken, saveSessionToken, clearSessionToken } from './session'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

// Better Auth client configured for React Native:
// - No cookies (RN has no cookie jar)
// - Session token stored in expo-secure-store
// - Bearer token sent via Authorization header
export const authClient = createAuthClient({
  baseURL: `${API_URL}/auth`,
  fetchOptions: {
    // Attach stored session token to every request
    onRequest: async (ctx) => {
      const token = await loadSessionToken()
      if (token) {
        ctx.options.headers = {
          ...ctx.options.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    },
    // Persist new session token from response
    onResponse: async (ctx) => {
      const token = ctx.response.headers.get('set-auth-token')
      if (token) {
        await saveSessionToken(token)
      }
    },
  },
  plugins: [suiWalletClientPlugin()],
})

// ── SUI wallet client plugin ──────────────────────────────────────────────────
// Matches the server-side sui-auth-plugin endpoints.
function suiWalletClientPlugin() {
  return {
    id: 'sui-wallet',
    $InferServerPlugin: {} as import('@/lib/auth/sui-wallet-plugin-types').SuiWalletPlugin,
    getActions: ($fetch: (path: string, options?: RequestInit) => Promise<Response>) => ({
      suiWallet: {
        signIn: async () => {
          try {
            // 1. Get nonce from server
            const nonceRes = await $fetch('/sui/get-nonce', { method: 'POST' })
            if (!nonceRes.ok) {
              return { data: null, error: { message: 'Failed to get nonce' } }
            }
            const { nonce } = await nonceRes.json()

            // 2. Sign with wallet — calls into @mysten/dapp-kit or custom wallet adapter
            const { walletAddress, signature, message } = await signWithSuiWallet(nonce)

            // 3. Verify on server → creates session
            const verifyRes = await $fetch('/sui/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ walletAddress, signature, message }),
            })
            if (!verifyRes.ok) {
              const err = await verifyRes.json()
              return { data: null, error: { message: err.message ?? 'Verification failed' } }
            }

            const sessionData = await verifyRes.json()
            if (sessionData.token) {
              await saveSessionToken(sessionData.token)
            }
            return { data: sessionData, error: null }
          } catch (e) {
            return { data: null, error: { message: String(e) } }
          }
        },
      },
    }),
  }
}

// ── SUI wallet signing ────────────────────────────────────────────────────────
// Wire this up to your wallet adapter of choice (e.g. @mysten/dapp-kit,
// a custom hardware wallet, or zkLogin). Returns the triple needed by the server.
async function signWithSuiWallet(
  nonce: string,
): Promise<{ walletAddress: string; signature: string; message: string }> {
  // TODO: integrate @mysten/sui wallet adapter
  // Example with @mysten/dapp-kit:
  //   const { mutateAsync: signPersonalMessage } = useSignPersonalMessage()
  //   const account = useCurrentAccount()
  //   const message = `Sign in to Sessions\nNonce: ${nonce}`
  //   const { signature } = await signPersonalMessage({ message: toBytes(message) })
  //   return { walletAddress: account.address, signature, message }
  throw new Error('SUI wallet adapter not configured — see lib/auth/client.ts')
}
