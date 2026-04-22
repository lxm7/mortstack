import http from 'node:http';
import { createHTTPHandler } from '@trpc/server/adapters/standalone';
import { appRouter } from './router';
import { resolveContext } from './trpc';
import { auth } from './lib/auth';

const PORT = process.env.PORT || 3001;

// tRPC handler (existing)
const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: async ({ req }) => {
    return resolveContext({
      authorization: req.headers.authorization,
      'x-profile-id': req.headers['x-profile-id'] as string | undefined,
    });
  },
});

// Route: /auth/* → Better Auth, everything else → tRPC
const server = http.createServer(async (req, res) => {
  const url = req.url ?? '';

  if (url.startsWith('/auth')) {
    // Better Auth handles its own routing internally
    return auth.handler(req, res);
  }

  // Add CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-profile-id');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  return trpcHandler(req, res);
});

server.listen(PORT);
console.log(`Server running on http://localhost:${PORT}`);
console.log(`  tRPC:        http://localhost:${PORT}/trpc`);
console.log(`  Better Auth: http://localhost:${PORT}/auth`);
