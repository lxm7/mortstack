import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, protectedProcedure } from "../trpc";

// Reports surface — App Store Guideline 1.2 + Play Store UGC policy.
//
// Polymorphic target (USER / MESSAGE / PROFILE / POST) keyed by targetType +
// targetId. The Report row is the moderation queue's input — a future
// subscriber (Slack/email/CI) tails the table. For Phase 1 we just write
// the row + WARN-log a summary so an on-call operator can grep server logs.
//
// Rate limit: 10 reports per hour per reporter, enforced via an in-process
// count query against createdAt. Crude but adequate at MVP scale; if a
// reporter spams more than 10/h they're almost certainly griefing.
//
// Dedupe: (reporterId, targetType, targetId, reason) is UNIQUE in the
// schema — a second identical report returns the existing row's id.

const REPORT_NOTES_MAX = 1000;
const REPORTS_PER_HOUR = 10;

export const reportsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        targetType: z.enum(["USER", "MESSAGE", "PROFILE", "POST"]),
        targetId: z.string().min(1).max(100),
        reason: z.enum([
          "SPAM",
          "HARASSMENT",
          "ILLEGAL",
          "VIOLENCE",
          "SEXUAL_CONTENT",
          "IMPERSONATION",
          "OTHER",
        ]),
        notes: z.string().max(REPORT_NOTES_MAX).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Self-report guard for USER target — pointless and could be used to
      // poison the moderation queue against oneself.
      if (input.targetType === "USER" && input.targetId === ctx.account.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot report yourself",
        });
      }

      // Rate-limit check — count reports in last hour.
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentCount = await ctx.prisma.report.count({
        where: {
          reporterId: ctx.account.id,
          createdAt: { gte: oneHourAgo },
        },
      });
      if (recentCount >= REPORTS_PER_HOUR) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Too many reports — try again later",
        });
      }

      // Upsert on the dedupe constraint — identical re-report returns the
      // existing row id without creating noise in the queue.
      const row = await ctx.prisma.report.upsert({
        where: {
          reporterId_targetType_targetId_reason: {
            reporterId: ctx.account.id,
            targetType: input.targetType,
            targetId: input.targetId,
            reason: input.reason,
          },
        },
        create: {
          reporterId: ctx.account.id,
          targetType: input.targetType,
          targetId: input.targetId,
          reason: input.reason,
          notes: input.notes ?? null,
        },
        update: input.notes ? { notes: input.notes } : {},
        select: { id: true, createdAt: true, status: true },
      });

      // WARN log for the on-call operator. Structured so grep/jq can extract.
      console.warn(
        "[moderation] report created",
        JSON.stringify({
          reportId: row.id,
          reporterId: ctx.account.id,
          targetType: input.targetType,
          targetId: input.targetId,
          reason: input.reason,
          notesPresent: !!input.notes,
        }),
      );

      return {
        reportId: row.id,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      };
    }),
});
