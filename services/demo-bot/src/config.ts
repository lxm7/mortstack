import { resolve } from "node:path";

// Runtime config for the demo bot. Everything overridable by env so the same
// binary runs against a local stack (defaults) or a deployed stage. The
// concierge credentials MUST be provided — the bot signs in (or signs up on
// first run) to obtain a Better Auth bearer, exactly like a device does.
export interface BotConfig {
  apiUrl: string;
  wsUrl: string;
  email: string;
  password: string;
  name: string;
  stateDir: string;
}

export function loadConfig(): BotConfig {
  const email = process.env.DEMO_BOT_EMAIL;
  const password = process.env.DEMO_BOT_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "DEMO_BOT_EMAIL and DEMO_BOT_PASSWORD must be set (add them to services/demo-bot/.env or export them). See .env.example.",
    );
  }
  return {
    apiUrl: process.env.MORTSTACK_API_URL ?? "http://localhost:3001",
    wsUrl: process.env.MORTSTACK_WS_URL ?? "ws://localhost:8787",
    email,
    password,
    name: process.env.DEMO_BOT_NAME ?? "Mortstack Concierge",
    // Bot MLS state (engine snapshot + group/chat registry + identity seed)
    // lives here for the tracer. Productionises to a Neon table for Lambda.
    stateDir: process.env.DEMO_BOT_STATE_DIR
      ? resolve(process.env.DEMO_BOT_STATE_DIR)
      : resolve(process.cwd(), ".demo-bot-state"),
  };
}
