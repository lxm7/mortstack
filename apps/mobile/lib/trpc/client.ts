import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/api-server";
import { API_URL } from "@/lib/api/url";
import { loadSessionToken } from "@/lib/auth/session";

// Typed tRPC client for the mobile app. Routes through the Lambda's
// /trpc/* endpoint with the same Better Auth bearer header that
// apps/mobile/lib/auth/client.ts uses for the auth surface.
//
// Token is resolved per-request (not captured at client construction) so a
// fresh login or rotation is picked up without re-instantiating the client.
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers: async () => {
        const token = await loadSessionToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
