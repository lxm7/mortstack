-- CreateTable
CREATE TABLE "UserDevice" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ed25519Pub" BYTEA NOT NULL,
    "x25519Pub" BYTEA NOT NULL,
    "bundleSignature" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserDevice_accountId_idx" ON "UserDevice"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDevice_accountId_deviceId_key" ON "UserDevice"("accountId", "deviceId");

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
