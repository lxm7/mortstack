/*
  Warnings:

  - A unique constraint covering the columns `[mlsGroupId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "mlsGroupId" BYTEA;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_mlsGroupId_key" ON "Chat"("mlsGroupId");
