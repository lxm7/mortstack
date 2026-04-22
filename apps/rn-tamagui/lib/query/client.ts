import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Replicache handles offline caching — keep stale time short
      // so RQ re-reads from Replicache subscriptions promptly
      staleTime: 1_000,
      gcTime: 5 * 60 * 1_000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      // Mutations go through Replicache — no RQ retry needed
      retry: false,
    },
  },
})
