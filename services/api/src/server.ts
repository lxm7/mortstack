import { createHTTPServer } from '@trpc/server/adapters/standalone';
import type { IncomingMessage } from 'http';
import { appRouter } from './router';
import { prisma } from '@repo/database';
import { verifyAccessToken } from '@repo/auth';

const PORT = process.env.PORT || 3001;

function getUserFromRequest(req: IncomingMessage) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const payload = verifyAccessToken(authHeader.substring(7));
    return { id: payload.userId, walletAddress: payload.walletAddress };
  } catch {
    return null;
  }
}

const server = createHTTPServer({
  router: appRouter,
  createContext: async ({ req }) => ({
    prisma,
    user: getUserFromRequest(req),
  }),
});

server.listen(PORT);

console.log(`🚀 tRPC server running on http://localhost:${PORT}`);
