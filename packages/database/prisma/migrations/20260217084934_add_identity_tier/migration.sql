-- CreateEnum
CREATE TYPE "IdentityTier" AS ENUM ('NONE', 'BASIC', 'CREATOR', 'ARTIST');

-- CreateEnum
CREATE TYPE "IdentityCheckStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "identityTier" "IdentityTier" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "identityVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "IdentityCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "tier" "IdentityTier" NOT NULL,
    "status" "IdentityCheckStatus" NOT NULL,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "providerPayload" JSONB,

    CONSTRAINT "IdentityCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdentityCheck_userId_idx" ON "IdentityCheck"("userId");

-- CreateIndex
CREATE INDEX "IdentityCheck_provider_externalId_idx" ON "IdentityCheck"("provider", "externalId");

-- CreateIndex
CREATE INDEX "User_identityTier_idx" ON "User"("identityTier");

-- AddForeignKey
ALTER TABLE "IdentityCheck" ADD CONSTRAINT "IdentityCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
