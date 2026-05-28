import "dotenv/config";
import { prisma } from "../src";

// Usage:
//   pnpm --filter @repo/database exec tsx scripts/seed-debug-chat.ts \
//     --chat debug-chat \
//     --members <accountId1>,<accountId2>
//
// Creates the Chat row (or reuses if exists) and adds a ChatMember row per
// member. Members are resolved from Account.id → Account.authUserId since
// ChatMember.userId stores the Better Auth user id (matches what the chat-ws
// Worker derives from the bearer token at WS upgrade). Re-runnable; uses
// upsert semantics throughout.
//
// Idempotent — re-running with the same args is a no-op.

function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const chatId = arg("chat") ?? "debug-chat";
  const membersArg = arg("members");
  if (!membersArg) {
    console.error("missing --members <accountId1>,<accountId2>[,…]");
    process.exit(2);
  }
  const accountIds = membersArg
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (accountIds.length < 1) {
    console.error("--members must list at least one accountId");
    process.exit(2);
  }

  // Resolve accountIds → authUserIds. ChatMember.userId references AuthUser.
  const accounts = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, authUserId: true, email: true },
  });
  const known = new Set(accounts.map((a) => a.id));
  const missing = accountIds.filter((id) => !known.has(id));
  if (missing.length > 0) {
    console.error(`unknown accountIds: ${missing.join(", ")}`);
    process.exit(2);
  }

  // Upsert chat by id. Default kind = DIRECT when 2 members, GROUP otherwise.
  const chat = await prisma.chat.upsert({
    where: { id: chatId },
    create: {
      id: chatId,
      kind: accounts.length === 2 ? "DIRECT" : "GROUP",
    },
    update: {},
    select: { id: true, kind: true, createdAt: true },
  });

  // Upsert each member. (chatId, userId) is unique.
  const members = await Promise.all(
    accounts.map((a) =>
      prisma.chatMember.upsert({
        where: { chatId_userId: { chatId: chat.id, userId: a.authUserId } },
        create: { chatId: chat.id, userId: a.authUserId },
        update: {},
        select: { id: true, userId: true, joinedAt: true },
      }),
    ),
  );

  console.log("chat:", chat);
  for (const a of accounts) {
    const m = members.find((x) => x.userId === a.authUserId);
    console.log(
      `  member: account=${a.id} authUserId=${a.authUserId} email=${a.email ?? "?"} chatMemberId=${m?.id}`,
    );
  }
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
