import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { api } from "@repo/api";
import { useAuthStore } from "../store/auth";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.yourapp.com";

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep inactive queries in cache for 10 minutes (offline support)
            gcTime: 10 * 60 * 1000,
            // Retry failed requests twice before showing error
            retry: 2,
            // Don't refetch on window focus (not relevant on mobile)
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/trpc`,
          headers: () =>
            accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
