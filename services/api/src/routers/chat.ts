import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

// ── chat.* ──────────────────────────────────────────────────────────────────
// Chat-CRUD surface for M4. Membership is stored on ChatMember.userId
// (Better Auth user id, matching chat-ws DO routing); the public API speaks
// accountId (cuid) since that's the canonical domain identifier — the
// caller passes accountIds, we resolve to authUserIds at the boundary.
//
// MLS group lifecycle is NOT touched here. Server returns chatId; client
// follows up with MlsClient.createGroup({chatId}) then addMembersByAccounts.
// If a peer has no KeyPackages at add-time the MLS step fails non-atomically
// (Q1e) — the chat row + ChatMember rows still exist; UI surfaces "pending".

const CHAT_NAME_MAX = 80;
const MEMBER_BATCH_MAX = 50;
const CHAT_LIST_LIMIT_MAX = 100;

const AccountIdCuid = z.string().cuid();
const ChatIdCuid = z.string().cuid();

const ChatPreview = z.object({
  id: z.string(),
  kind: z.enum(["direct", "group"]),
  name: z.string().nullable(),
  createdAt: z.string(),
  members: z.array(
    z.object({
      accountId: z.string(),
      handle: z.string().nullable(),
      displayName: z.string().nullable(),
    }),
  ),
});

// Resolve a batch of accountIds to (Account.id, Account.authUserId). Throws
// on any miss — callers pass accountIds that MUST exist (the search RPC
// returned them, or the local chat list cached them). Banned accounts are
// returned in the result so the caller can surface a useful error.
async function resolveAccounts(
  prisma: import("@repo/database").PrismaClient,
  accountIds: string[],
): Promise<Array<{ id: string; authUserId: string; isBanned: boolean }>> {
  if (accountIds.length === 0) return [];
  const rows = await prisma.account.findMany({
    where: { id: { in: accountIds } },
    select: { id: true, authUserId: true, isBanned: true },
  });
  if (rows.length !== accountIds.length) {
    const missing = accountIds.filter((id) => !rows.some((r) => r.id === id));
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `account(s) not found: ${missing.join(",")}`,
    });
  }
  const banned = rows.filter((r) => r.isBanned).map((r) => r.id);
  if (banned.length > 0) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `account(s) banned: ${banned.join(",")}`,
    });
  }
  return rows;
}

// For each provided authUserId, return the (accountId, primary Profile)
// pair. Primary Profile = oldest OWNER ProfileMember. Phase 1 typically has
// one Profile per Account; multi-persona disambiguation is a later milestone.
async function loadMemberDisplay(
  prisma: import("@repo/database").PrismaClient,
  authUserIds: string[],
): Promise<
  Map<
    string,
    { accountId: string; handle: string | null; displayName: string | null }
  >
> {
  if (authUserIds.length === 0) return new Map();
  const accounts = await prisma.account.findMany({
    where: { authUserId: { in: authUserIds } },
    select: {
      id: true,
      authUserId: true,
      profiles: {
        orderBy: { createdAt: "asc" },
        take: 1,
        select: {
          profile: { select: { handle: true, displayName: true } },
        },
      },
    },
  });
  const out = new Map<
    string,
    { accountId: string; handle: string | null; displayName: string | null }
  >();
  for (const a of accounts) {
    const p = a.profiles[0]?.profile;
    out.set(a.authUserId, {
      accountId: a.id,
      handle: p?.handle ?? null,
      displayName: p?.displayName ?? null,
    });
  }
  return out;
}

export const chatRouter = router({
  // Create a new chat. Direct chats are idempotent: if a direct chat
  // already exists between the caller and the requested peer, return that
  // existing chatId + `existing: true`. Group chats always create fresh.
  //
  // Caller is auto-added as a ChatMember; memberAccountIds is the OTHERS.
  create: protectedProcedure
    .input(
      z.object({
        kind: z.enum(["direct", "group"]),
        name: z.string().min(1).max(CHAT_NAME_MAX).nullish(),
        memberAccountIds: z.array(AccountIdCuid).min(1).max(MEMBER_BATCH_MAX),
      }),
    )
    .output(
      z.object({
        chatId: z.string(),
        createdAt: z.string(),
        existing: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const others = Array.from(new Set(input.memberAccountIds)).filter(
        (id) => id !== ctx.account.id,
      );
      if (others.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "memberAccountIds cannot be only the caller",
        });
      }
      if (input.kind === "direct" && others.length !== 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "direct chat requires exactly 1 other member",
        });
      }
      if (input.kind === "direct" && input.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "direct chat cannot have a name",
        });
      }

      const resolved = await resolveAccounts(ctx.prisma, others);

      // Direct-chat idempotency: caller + 1 other → find existing.
      if (input.kind === "direct") {
        const peerAuthUserId = resolved[0]!.authUserId;
        const candidate = await ctx.prisma.chat.findFirst({
          where: {
            kind: "DIRECT",
            AND: [
              { members: { some: { userId: ctx.account.authUserId } } },
              { members: { some: { userId: peerAuthUserId } } },
            ],
          },
          select: { id: true, createdAt: true },
        });
        if (candidate) {
          return {
            chatId: candidate.id,
            createdAt: candidate.createdAt.toISOString(),
            existing: true,
          };
        }
      }

      const allMembers = [
        ctx.account.authUserId,
        ...resolved.map((r) => r.authUserId),
      ];
      const chat = await ctx.prisma.chat.create({
        data: {
          kind: input.kind === "direct" ? "DIRECT" : "GROUP",
          name: input.name ?? null,
          members: {
            create: allMembers.map((userId) => ({ userId })),
          },
        },
        select: { id: true, createdAt: true },
      });

      return {
        chatId: chat.id,
        createdAt: chat.createdAt.toISOString(),
        existing: false,
      };
    }),

  // List chats the caller is a member of. Sorted by Chat.createdAt DESC for
  // M4 — proper last-message-at sort needs a cross-partition read into the
  // partitioned ChatMessage table OR a Chat.updatedAt column bumped by the
  // chat-ws Worker on insert. Filed as M4 follow-up; Phase 1 users have few
  // enough chats that creation-order is acceptable until we wire that up.
  list: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().int().min(1).max(CHAT_LIST_LIMIT_MAX).default(50),
      }),
    )
    .output(
      z.object({
        chats: z.array(ChatPreview),
        nextCursor: z.string().nullable(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const rows = await ctx.prisma.chat.findMany({
        where: { members: { some: { userId: ctx.account.authUserId } } },
        orderBy: { createdAt: "desc" },
        take: input.limit + 1,
        ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
        select: {
          id: true,
          kind: true,
          name: true,
          createdAt: true,
          members: { select: { userId: true } },
        },
      });

      const hasMore = rows.length > input.limit;
      const trimmed = hasMore ? rows.slice(0, input.limit) : rows;
      const allUserIds = Array.from(
        new Set(trimmed.flatMap((c) => c.members.map((m) => m.userId))),
      );
      const display = await loadMemberDisplay(ctx.prisma, allUserIds);

      return {
        chats: trimmed.map((c) => ({
          id: c.id,
          kind: c.kind === "DIRECT" ? ("direct" as const) : ("group" as const),
          name: c.name,
          createdAt: c.createdAt.toISOString(),
          members: c.members.map((m) => {
            const d = display.get(m.userId);
            return {
              accountId: d?.accountId ?? "",
              handle: d?.handle ?? null,
              displayName: d?.displayName ?? null,
            };
          }),
        })),
        nextCursor: hasMore ? trimmed[trimmed.length - 1]!.id : null,
      };
    }),

  get: protectedProcedure
    .input(z.object({ chatId: ChatIdCuid }))
    .output(ChatPreview)
    .query(async ({ input, ctx }) => {
      const chat = await ctx.prisma.chat.findFirst({
        where: {
          id: input.chatId,
          members: { some: { userId: ctx.account.authUserId } },
        },
        select: {
          id: true,
          kind: true,
          name: true,
          createdAt: true,
          members: { select: { userId: true } },
        },
      });
      if (!chat) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "chat not found or caller is not a member",
        });
      }
      const display = await loadMemberDisplay(
        ctx.prisma,
        chat.members.map((m) => m.userId),
      );
      return {
        id: chat.id,
        kind: chat.kind === "DIRECT" ? ("direct" as const) : ("group" as const),
        name: chat.name,
        createdAt: chat.createdAt.toISOString(),
        members: chat.members.map((m) => {
          const d = display.get(m.userId);
          return {
            accountId: d?.accountId ?? "",
            handle: d?.handle ?? null,
            displayName: d?.displayName ?? null,
          };
        }),
      };
    }),

  leave: protectedProcedure
    .input(z.object({ chatId: ChatIdCuid }))
    .output(z.object({ ok: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      // Idempotent — leaving twice is fine. Membership row may have already
      // been removed by an admin's removeMembers call.
      await ctx.prisma.chatMember.deleteMany({
        where: {
          chatId: input.chatId,
          userId: ctx.account.authUserId,
        },
      });
      return { ok: true as const };
    }),

  // Any member can add others (Q1c a — Telegram default). Server only
  // mutates ChatMember rows; client follows up with the MLS add via
  // MlsClient.addMembersByAccounts (which itself goes through mls.keys.*
  // + mls.groups.*).
  addMembers: protectedProcedure
    .input(
      z.object({
        chatId: ChatIdCuid,
        accountIds: z.array(AccountIdCuid).min(1).max(MEMBER_BATCH_MAX),
      }),
    )
    .output(z.object({ added: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const me = await ctx.prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: input.chatId,
            userId: ctx.account.authUserId,
          },
        },
        select: { id: true },
      });
      if (!me) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "caller is not a member of this chat",
        });
      }

      const resolved = await resolveAccounts(ctx.prisma, input.accountIds);
      const existing = await ctx.prisma.chatMember.findMany({
        where: {
          chatId: input.chatId,
          userId: { in: resolved.map((r) => r.authUserId) },
        },
        select: { userId: true },
      });
      const existingUserIds = new Set(existing.map((e) => e.userId));
      const toAdd = resolved.filter((r) => !existingUserIds.has(r.authUserId));

      if (toAdd.length === 0) return { added: [] };

      await ctx.prisma.chatMember.createMany({
        data: toAdd.map((r) => ({
          chatId: input.chatId,
          userId: r.authUserId,
        })),
      });
      return { added: toAdd.map((r) => r.id) };
    }),

  removeMembers: protectedProcedure
    .input(
      z.object({
        chatId: ChatIdCuid,
        accountIds: z.array(AccountIdCuid).min(1).max(MEMBER_BATCH_MAX),
      }),
    )
    .output(z.object({ removed: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      const me = await ctx.prisma.chatMember.findUnique({
        where: {
          chatId_userId: {
            chatId: input.chatId,
            userId: ctx.account.authUserId,
          },
        },
        select: { id: true },
      });
      if (!me) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "caller is not a member of this chat",
        });
      }

      const resolved = await resolveAccounts(ctx.prisma, input.accountIds);
      // Defensively prevent self-removal via this endpoint — use leave().
      const targetUserIds = resolved
        .filter((r) => r.authUserId !== ctx.account.authUserId)
        .map((r) => r.authUserId);
      if (targetUserIds.length === 0) return { removed: [] };

      const result = await ctx.prisma.chatMember.deleteMany({
        where: {
          chatId: input.chatId,
          userId: { in: targetUserIds },
        },
      });
      return {
        removed: resolved
          .filter((r) => targetUserIds.includes(r.authUserId))
          .slice(0, result.count)
          .map((r) => r.id),
      };
    }),
});
