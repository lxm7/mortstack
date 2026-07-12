import { loadConfig } from "./config.js";
import { createBot, addUserToDemo, verifySlice1 } from "./bot.js";

const USAGE = `demo-bot — headless MLS concierge (tracer)

  pnpm --filter @repo/demo-bot bot whoami
      Authenticate, print the bot's domain accountId + deviceId.

  pnpm --filter @repo/demo-bot bot add <userAccountId> [lobbyName]
      Ensure the user is in a demo lobby (founding one with them if none exists)
      via a real MLS Add + Welcome. Default lobby name "Welcome Lobby".

  pnpm --filter @repo/demo-bot bot lobbies
      List the lobbies this bot has founded (from local state).

  pnpm --filter @repo/demo-bot bot verify
      Sim-free end-to-end proof: spin up a throwaway KP-publishing user, add it,
      assert it joins from the bot's Welcome. Exits non-zero on failure.

Env: DEMO_BOT_EMAIL, DEMO_BOT_PASSWORD required (see .env.example).`;

async function main(): Promise<void> {
  const [cmd, ...args] = process.argv.slice(2);
  const cfg = loadConfig();

  switch (cmd) {
    case "whoami": {
      const bot = await createBot(cfg);
      console.log(`accountId=${bot.accountId} deviceId=${bot.deviceId}`);
      break;
    }
    case "add": {
      const [userAccountId, lobbyName] = args;
      if (!userAccountId)
        throw new Error("usage: bot add <userAccountId> [lobbyName]");
      const bot = await createBot(cfg);
      await addUserToDemo(bot, userAccountId, lobbyName ?? "Welcome Lobby");
      break;
    }
    case "lobbies": {
      const bot = await createBot(cfg);
      for (const c of bot.store.listChats()) {
        console.log(
          `${c.id}  ${c.name ?? "(no name)"}  ${c.mlsGroupIdB64 ? "linked" : "unlinked"}`,
        );
      }
      break;
    }
    case "verify": {
      const ok = await verifySlice1(cfg);
      if (!ok) process.exitCode = 1;
      break;
    }
    default:
      console.log(USAGE);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
