-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('USER', 'MESSAGE', 'PROFILE', 'POST');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'ILLEGAL', 'VIOLENCE', 'SEXUAL_CONTENT', 'IMPERSONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- CreateTable
CREATE TABLE "Blocklist" (
    "id" TEXT NOT NULL,
    "blockerAccountId" TEXT NOT NULL,
    "blockedAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blocklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetType" "ReportTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "notes" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerId" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Blocklist_blockerAccountId_blockedAccountId_key" ON "Blocklist"("blockerAccountId", "blockedAccountId");

-- CreateIndex
CREATE INDEX "Blocklist_blockerAccountId_idx" ON "Blocklist"("blockerAccountId");

-- CreateIndex
CREATE INDEX "Blocklist_blockedAccountId_idx" ON "Blocklist"("blockedAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_targetType_targetId_reason_key" ON "Report"("reporterId", "targetType", "targetId", "reason");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Blocklist" ADD CONSTRAINT "Blocklist_blockerAccountId_fkey" FOREIGN KEY ("blockerAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocklist" ADD CONSTRAINT "Blocklist_blockedAccountId_fkey" FOREIGN KEY ("blockedAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
