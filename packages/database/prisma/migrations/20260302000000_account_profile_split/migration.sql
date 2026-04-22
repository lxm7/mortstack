-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('MUSICIAN', 'VENUE', 'PROMOTER', 'VISUAL_ARTIST', 'BAND');

-- CreateEnum
CREATE TYPE "ProfileRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropForeignKey
ALTER TABLE "IdentityCheck" DROP CONSTRAINT "IdentityCheck_userId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "NFT" DROP CONSTRAINT "NFT_userId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropIndex
DROP INDEX "Comment_userId_idx";

-- DropIndex
DROP INDEX "IdentityCheck_userId_idx";

-- DropIndex
DROP INDEX "Like_postId_userId_key";

-- DropIndex
DROP INDEX "Like_userId_idx";

-- DropIndex
DROP INDEX "NFT_userId_idx";

-- DropIndex
DROP INDEX "Post_userId_idx";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IdentityCheck" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NFT" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "passwordHash" TEXT,
    "walletAddress" TEXT,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "identityTier" "IdentityTier" NOT NULL DEFAULT 'NONE',
    "identityVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "type" "ProfileType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "reputation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileMember" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "role" "ProfileRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_walletAddress_key" ON "Account"("walletAddress");

-- CreateIndex
CREATE INDEX "Account_walletAddress_idx" ON "Account"("walletAddress");

-- CreateIndex
CREATE INDEX "Account_email_idx" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_handle_key" ON "Profile"("handle");

-- CreateIndex
CREATE INDEX "Profile_handle_idx" ON "Profile"("handle");

-- CreateIndex
CREATE INDEX "Profile_type_idx" ON "Profile"("type");

-- CreateIndex
CREATE INDEX "ProfileMember_accountId_idx" ON "ProfileMember"("accountId");

-- CreateIndex
CREATE INDEX "ProfileMember_profileId_idx" ON "ProfileMember"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileMember_accountId_profileId_key" ON "ProfileMember"("accountId", "profileId");

-- CreateIndex
CREATE INDEX "Comment_profileId_idx" ON "Comment"("profileId");

-- CreateIndex
CREATE INDEX "IdentityCheck_accountId_idx" ON "IdentityCheck"("accountId");

-- CreateIndex
CREATE INDEX "Like_profileId_idx" ON "Like"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_postId_profileId_key" ON "Like"("postId", "profileId");

-- CreateIndex
CREATE INDEX "NFT_profileId_idx" ON "NFT"("profileId");

-- CreateIndex
CREATE INDEX "Post_profileId_idx" ON "Post"("profileId");

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileMember" ADD CONSTRAINT "ProfileMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityCheck" ADD CONSTRAINT "IdentityCheck_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NFT" ADD CONSTRAINT "NFT_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

