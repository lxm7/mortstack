import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

// Surface the resolved Account on the authenticated context. Lets clients
// learn their own accountId without making a separate Prisma query — used by
// the M3 acceptance harness in apps/mobile/app/chat-db-debug.tsx and any
// future UI that needs the canonical Account.id for chat routing.
export const accountRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    // Primary Profile = oldest OWNER membership. Phase 1 is single-Profile
    // per Account in practice; the join is here so the multi-persona
    // milestone doesn't have to touch this endpoint.
    const primary = await ctx.prisma.profileMember.findFirst({
      where: { accountId: ctx.account.id, role: "OWNER" },
      orderBy: { profile: { createdAt: "asc" } },
      select: { profile: { select: { displayName: true } } },
    });
    return {
      accountId: ctx.account.id,
      identityTier: ctx.account.identityTier,
      displayName: primary?.profile.displayName ?? null,
    };
  }),

  // Account self-deletion — App Store Guideline 5.1.1(v) + Play Store
  // account-deletion policy. Hard delete, no recovery window.
  //
  // Cascade order (atomic Prisma transaction):
  //   1. ChatMember.deleteMany({ userId: authUserId })
  //      — no FK to Account (chat-ws uses userId = authUserId directly), so
  //      do it explicitly before AuthUser delete.
  //   2. Profile orphan cleanup — find profiles where this account is the
  //      sole OWNER and delete them (cascades Posts/Comments/Likes/Follows/
  //      NFTs). Profiles with other OWNERs survive; this account's
  //      ProfileMember row goes away via the Account cascade in step 3.
  //   3. AuthUser delete — cascades Session, AuthAccount, Account, then
  //      Account cascades UserDevice (→ KeyPackage, PushToken),
  //      ProfileMember, IdentityCheck, GroupWelcome, Blocklist (both
  //      directions), Report (as reporter).
  //
  // NOT deleted (deliberate):
  //   - ChatMessage rows authored by this user — they live in the
  //     partitioned table managed by chat-ws (no Prisma FK). Ciphertext
  //     stays; senderId becomes orphan (recipients see "Unknown sender").
  //   - GroupCommit rows — MLS group state survives so remaining members
  //     can continue using the group.
  //   - ChatMessage rows in groups this user belonged to — same reason.
  //
  // The `confirmation: "DELETE"` literal is a defence against accidental
  // calls (e.g. misrouted automation). UI requires the user to type it.
  deleteSelf: protectedProcedure
    .input(z.object({ confirmation: z.literal("DELETE") }))
    .mutation(async ({ ctx }) => {
      const accountId = ctx.account.id;
      const authUserId = ctx.account.authUserId;

      await ctx.prisma.$transaction(async (tx) => {
        // Step 1 — drop the user from every chat they're in.
        await tx.chatMember.deleteMany({ where: { userId: authUserId } });

        // Step 2 — orphan-profile cleanup. Find all profiles this account
        // OWNs; for each, count OTHER owners. If zero remain, delete the
        // whole profile (which cascades all profile-owned content).
        const ownerships = await tx.profileMember.findMany({
          where: { accountId, role: "OWNER" },
          select: { profileId: true },
        });
        if (ownerships.length > 0) {
          const profileIds = ownerships.map((o) => o.profileId);
          const otherOwners = await tx.profileMember.groupBy({
            by: ["profileId"],
            where: {
              profileId: { in: profileIds },
              role: "OWNER",
              accountId: { not: accountId },
            },
            _count: { _all: true },
          });
          const survivingProfileIds = new Set(
            otherOwners.map((g) => g.profileId),
          );
          const orphanProfileIds = profileIds.filter(
            (id) => !survivingProfileIds.has(id),
          );
          if (orphanProfileIds.length > 0) {
            await tx.profile.deleteMany({
              where: { id: { in: orphanProfileIds } },
            });
          }
        }

        // Step 3 — drop the AuthUser. Cascades Session, AuthAccount, Account,
        // and via Account: UserDevice, KeyPackage, PushToken, ProfileMember
        // (any remaining non-owner rows), IdentityCheck, GroupWelcome,
        // Blocklist (both relations), Report (reporter side).
        await tx.authUser.delete({ where: { id: authUserId } });
      });

      // Defensive WARN log — useful when investigating "user gone, where?"
      // tickets weeks later when the row no longer exists to query.
      console.warn(
        "[account] deleteSelf completed",
        JSON.stringify({ accountId, authUserId, at: new Date().toISOString() }),
      );

      return { ok: true as const };
    }),
});
