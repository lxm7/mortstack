import http from "node:http";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { toNodeHandler } from "better-auth/node";
import { appRouter } from "./router";
import { resolveContext } from "./trpc";
import { auth } from "./lib/auth";

const PORT = process.env.PORT || 3001;

// Better Auth handler — wraps auth for Node.js http compatibility
const authHandler = toNodeHandler(auth);

// tRPC handler — resolveContext now takes standard Headers (for Better Auth compat)
const trpcHandler = createHTTPHandler({
  router: appRouter,
  createContext: async ({ req }) => {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === "string") headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(", "));
    }
    return resolveContext(headers);
  },
});

// Route: /auth/* → Better Auth, everything else → tRPC
const server = http.createServer(async (req, res) => {
  const url = req.url ?? "";

  // CORS for all routes (local dev)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,x-profile-id",
  );
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url.startsWith("/auth")) {
    console.info(
      `[auth] ${req.method} ${url} | Origin: ${req.headers.origin ?? "NULL"}`,
    );
    return authHandler(req, res);
  }

  return trpcHandler(req, res);
});

server.listen(PORT);
console.info(`Server running on http://localhost:${PORT}`);
console.info(`  tRPC:        http://localhost:${PORT}/trpc`);
console.info(`  Better Auth: http://localhost:${PORT}/auth`);
