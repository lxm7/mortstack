import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/api-server";

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser: use relative path
    return "";
  }
  // Server: use full URL
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers: () => {
        // Get token from storage (implement based on your storage strategy)
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        return token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};
      },
    }),
  ],
});
