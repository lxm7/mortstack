// B1.7 — focused load test of the edge session cache (ADR-0017).
//
// Drives a WS connect / reconnect storm at the chat-ws Worker and measures
// connect latency. Pair it with the Worker's own counters:
//
//   1. Deploy chat-ws with SESSION_CACHE_METRICS=1 (infra/stacks/chat-ws.ts),
//      then in another terminal:  wrangler tail ChatWs --format=json | grep SCM
//   2. Run this script. Tally the SCM lines: r="hit"/"miss" = hit rate,
//      w=true = KV write rate (ADR-0017 §5 — the cost metric to watch).
//
// Compare two runs — cache ON vs OFF (flip SESSION_CACHE_ENABLED, redeploy):
// the delta in sc_connect_latency p95 is the DB-hot-path saving the cache buys.
//
// Tokens: setup() self-provisions LT_USERS test accounts (sign-up, ignore if
// they exist) and signs them in for real bearer tokens. VUs reuse tokens, so the
// first connect per token is a cache miss (populate) and the rest are hits.
//
// Usage:
//   k6 run \
//     -e API_URL=https://<api-lambda-url> \
//     -e WS_URL=wss://<chat-ws-worker-url> \
//     -e LT_USERS=200 -e LT_PASSWORD=loadtest-pw-123 \
//     loadtest/session-cache-connect.js

import ws from "k6/ws";
import http from "k6/http";
import encoding from "k6/encoding";
import { check, sleep } from "k6";
import { Trend, Counter } from "k6/metrics";

const API_URL = (__ENV.API_URL || "http://localhost:3001").replace(/\/$/, "");
const WS_URL = (__ENV.WS_URL || "ws://localhost:8787").replace(/\/$/, "");
const N_USERS = parseInt(__ENV.LT_USERS || "200", 10);
const PASSWORD = __ENV.LT_PASSWORD || "loadtest-pw-123";
const EMAIL_PREFIX = __ENV.LT_EMAIL_PREFIX || "loadtest";
// Run-scoped so every run provisions brand-new users → all sign-up (1 request,
// token via autoSignIn), deterministic 200/200, no cross-run password/sign-in
// dependency. Pass the same LT_RUN_ID to two runs to reuse a pool (ON vs OFF).
const RUN_ID = __ENV.LT_RUN_ID || String(Date.now());
const HOLD_MS = parseInt(__ENV.LT_HOLD_MS || "500", 10);
// Seconds to wait between setup() auth calls. Raise (e.g. 0.2) if Better Auth
// rate-limits the provisioning burst (429). Default 0 = as fast as possible.
const SETUP_DELAY = parseFloat(__ENV.LT_SETUP_DELAY || "0");

// Better Auth rejects auth requests with no Origin header (CSRF:
// MISSING_OR_NULL_ORIGIN). It auto-trusts its own baseURL, so sending the API's
// own origin passes. Override with LT_ORIGIN if your TRUSTED_ORIGINS differs.
function originOf(u) {
  const m = /^(https?:\/\/[^/]+)/.exec(u);
  return m ? m[1] : u;
}
const ORIGIN = __ENV.LT_ORIGIN || originOf(API_URL);
const AUTH_HEADERS = { "content-type": "application/json", Origin: ORIGIN };

const connectLatency = new Trend("sc_connect_latency", true);
const connectOk = new Counter("sc_connect_ok");
const connectFail = new Counter("sc_connect_fail");

export const options = {
  // Provisioning is sequential auth calls (~0.5s each on Lambda+Neon), so the
  // 60s default is too tight for a large pool. Raise it; drop LT_USERS for speed.
  setupTimeout: __ENV.LT_SETUP_TIMEOUT || "300s",
  scenarios: {
    // Reconnect storm — each iteration is one connect+close, so ramping VUs and
    // looping default() reproduces app-foreground / network-flap reconnects.
    reconnect_storm: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 500 },
        { duration: "30s", target: 0 },
      ],
      gracefulStop: "10s",
    },
  },
  thresholds: {
    // Tune against your baseline; the point is the ON-vs-OFF delta, not absolutes.
    sc_connect_latency: ["p(95)<1500"],
    sc_connect_fail: ["count<50"],
  },
};

// Better Auth returns the session token in the `set-auth-token` response header
// (bearer plugin). k6 may title-case header keys, so read case-insensitively.
function readHeader(headers, name) {
  const want = name.toLowerCase();
  for (const k in headers) {
    if (k.toLowerCase() === want) return headers[k];
  }
  return null;
}

function signUp(email) {
  // 200 = created; 4xx (e.g. already exists) is fine — we sign in next.
  return http.post(
    `${API_URL}/auth/sign-up/email`,
    JSON.stringify({ email, password: PASSWORD, name: email }),
    { headers: AUTH_HEADERS },
  );
}

function signIn(email) {
  return http.post(
    `${API_URL}/auth/sign-in/email`,
    JSON.stringify({ email, password: PASSWORD }),
    { headers: AUTH_HEADERS },
  );
}

export function setup() {
  const tokens = [];
  const via = { signin: 0, signup: 0, fail: 0 };
  let sampled = 0;
  for (let i = 0; i < N_USERS; i++) {
    const email = `${EMAIL_PREFIX}+${RUN_ID}-${i}@example.com`;
    // Sign-up first: a brand-new user (unique per run) mints in ONE request via
    // autoSignIn (set-auth-token header). Sign-in is only a fallback for the
    // reused-LT_RUN_ID case (user already exists → 422).
    let res = signUp(email);
    let token = readHeader(res.headers, "set-auth-token");
    if (token) {
      via.signup++;
    } else {
      res = signIn(email);
      token = readHeader(res.headers, "set-auth-token");
      if (token) via.signin++;
    }
    if (token) {
      tokens.push(token);
    } else {
      via.fail++;
      if (sampled < 3) {
        sampled++;
        console.error(
          `setup: ${email} no token; last ${res.status}: ${String(res.body).slice(0, 160)}`,
        );
      }
    }
    if (SETUP_DELAY > 0) sleep(SETUP_DELAY);
  }
  console.info(
    `setup: minted ${tokens.length}/${N_USERS} tokens ` +
      `(signin=${via.signin} signup=${via.signup} fail=${via.fail})`,
  );
  if (tokens.length === 0) {
    throw new Error(
      "setup: minted 0 tokens — check API_URL / Origin / credentials",
    );
  }
  return { tokens };
}

export default function (data) {
  const { tokens } = data;
  // Reuse tokens across VUs → mostly cache hits after the first populate.
  const token = tokens[(__VU + __ITER) % tokens.length];
  // base64url (no padding) — mirrors packages/chat-transport/src/client.ts, which
  // the Worker decodes in index.ts (Sec-WebSocket-Protocol tchar-safe).
  const encoded = encoding.b64encode(token, "rawurl");

  const params = {
    headers: {
      // "bearer, <base64url-token>" — exactly what the real client sends.
      "Sec-WebSocket-Protocol": `bearer, ${encoded}`,
    },
  };

  const start = Date.now();
  const res = ws.connect(WS_URL, params, function (socket) {
    socket.on("open", function () {
      connectLatency.add(Date.now() - start);
      connectOk.add(1);
      // Hold, then close so the next iteration reconnects.
      socket.setTimeout(function () {
        socket.close();
      }, HOLD_MS);
    });
  });

  const ok = check(res, { "ws handshake 101": (r) => r && r.status === 101 });
  if (!ok) connectFail.add(1);
}
