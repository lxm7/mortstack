import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@repo/api-server";

export const api = createTRPCReact<AppRouter>();

function getBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
}

export function getClientConfig() {
  return {
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
        headers: () => {
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
  };
}
