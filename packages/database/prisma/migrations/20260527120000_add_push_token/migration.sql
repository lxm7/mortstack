-- CreateEnum
CREATE TYPE "PushPlatform" AS ENUM ('APNS', 'FCM');

-- CreateTable
CREATE TABLE "PushToken" (
    "id" TEXT NOT NULL,
    "userDeviceId" TEXT NOT NULL,
    "platform" "PushPlatform" NOT NULL,
    "token" TEXT NOT NULL,
    "appBundleId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "PushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushToken_token_key" ON "PushToken"("token");

-- CreateIndex
CREATE INDEX "PushToken_userDeviceId_idx" ON "PushToken"("userDeviceId");

-- AddForeignKey
ALTER TABLE "PushToken" ADD CONSTRAINT "PushToken_userDeviceId_fkey" FOREIGN KEY ("userDeviceId") REFERENCES "UserDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
