import { createHTTPServer } from "@trpc/server/adapters/standalone";
import type { IncomingMessage } from "http";
import { appRouter } from "./router";
import { prisma } from "@repo/database";
import { verifyAccessToken } from "@repo/auth";
import type { Context } from "./trpc";

const PORT = process.env.PORT || 3001;

async function getUserFromRequest(
  req: IncomingMessage,
): Promise<Context["user"]> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const payload = verifyAccessToken(authHeader.substring(7));
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { identityTier: true },
    });
    return {
      id: payload.userId,
      walletAddress: payload.walletAddress,
      identityTier: dbUser?.identityTier ?? "NONE",
    };
  } catch {
    return null;
  }
}

const server = createHTTPServer({
  router: appRouter,
  createContext: async ({ req }) => ({
    prisma,
    user: await getUserFromRequest(req),
  }),
});

server.listen(PORT);

console.log(`🚀 tRPC server running on http://localhost:${PORT}`);
