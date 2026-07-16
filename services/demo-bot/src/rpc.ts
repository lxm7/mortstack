import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/api-server";
import type { MlsRpc } from "@repo/chat-mls-core/client";

export type TrpcClient = ReturnType<typeof createTrpc>;

// Typed tRPC client against the API's /trpc endpoint with the concierge bearer.
// Same shape as apps/mobile/lib/trpc/client.ts; token is captured for the run
// (the bot authenticates once at startup).
export function createTrpc(apiUrl: string, token: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiUrl}/trpc`,
        headers: () => ({ authorization: `Bearer ${token}` }),
      }),
    ],
  });
}

// The MlsRpc adapter MlsClient injects — the exact 8-method surface mobile's
// makeRpc() binds (apps/mobile/lib/chat/mls-auto-publish.ts), pointed at the
// Node tRPC client instead of the RN one.
export function makeMlsRpc(trpc: TrpcClient): MlsRpc {
  return {
    keysCount: (input) => trpc.mls.keys.count.query(input),
    keysDeleteAllForDevice: (input) =>
      trpc.mls.keys.deleteAllForDevice.mutate(input),
    keysPublish: (input) => trpc.mls.keys.publish.mutate(input),
    keysFetchForAccounts: (input) =>
      trpc.mls.keys.fetchForAccounts.query(input),
    groupsPublishCommit: (input) => trpc.mls.groups.publishCommit.mutate(input),
    groupsFetchPendingCommits: (input) =>
      trpc.mls.groups.fetchPendingCommits.query(input),
    groupsPublishWelcomes: (input) =>
      trpc.mls.groups.publishWelcomes.mutate(input),
    groupsFetchPendingWelcomes: () =>
      trpc.mls.groups.fetchPendingWelcomes.query(),
  };
}
