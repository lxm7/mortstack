import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './router';
import { prisma } from '@repo/database';

const PORT = process.env.PORT || 3001;

// For local development
const server = createHTTPServer({
  router: appRouter,
  createContext: async () => ({
    prisma,
    user: null, // No auth in dev server, add if needed
  }),
});

server.listen(PORT);

console.log(`🚀 tRPC server running on http://localhost:${PORT}`);
