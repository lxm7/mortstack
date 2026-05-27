import { trpc } from "@/lib/trpc/client";

export interface MyAccount {
  accountId: string;
  identityTier: string;
  // Primary Profile's display name. Null until the user creates a Profile.
  // Used by the chat pipe to attach `sender` to outbound v=2 frames so the
  // recipient's NSE can show "Alice: hi" instead of "New message".
  displayName: string | null;
}

// Singleton-cached fetch of the signed-in user's Account. The accountId is
// stable for the lifetime of the session, so caching avoids one tRPC call per
// component mount. Cleared by `forgetMyAccount` on logout (TODO when the auth
// store wires that signal).
let cached: Promise<MyAccount> | null = null;

export function getMyAccount(): Promise<MyAccount> {
  if (cached) return cached;
  cached = trpc.account.me.query() as Promise<MyAccount>;
  cached.catch(() => {
    cached = null;
  });
  return cached;
}

export function forgetMyAccount(): void {
  cached = null;
}
