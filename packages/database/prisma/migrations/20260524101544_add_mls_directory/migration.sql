-- CreateTable
CREATE TABLE "KeyPackage" (
    "id" TEXT NOT NULL,
    "userDeviceId" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupCommit" (
    "id" TEXT NOT NULL,
    "groupId" BYTEA NOT NULL,
    "epoch" INTEGER NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupCommit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupWelcome" (
    "id" TEXT NOT NULL,
    "recipientAccountId" TEXT NOT NULL,
    "recipientDeviceId" TEXT,
    "groupId" BYTEA NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupWelcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KeyPackage_userDeviceId_id_idx" ON "KeyPackage"("userDeviceId", "id");

-- CreateIndex
CREATE INDEX "GroupCommit_groupId_epoch_idx" ON "GroupCommit"("groupId", "epoch");

-- CreateIndex
CREATE UNIQUE INDEX "GroupCommit_groupId_epoch_key" ON "GroupCommit"("groupId", "epoch");

-- CreateIndex
CREATE INDEX "GroupWelcome_recipientAccountId_id_idx" ON "GroupWelcome"("recipientAccountId", "id");

-- AddForeignKey
ALTER TABLE "KeyPackage" ADD CONSTRAINT "KeyPackage_userDeviceId_fkey" FOREIGN KEY ("userDeviceId") REFERENCES "UserDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupWelcome" ADD CONSTRAINT "GroupWelcome_recipientAccountId_fkey" FOREIGN KEY ("recipientAccountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
