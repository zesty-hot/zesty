/*
  Warnings:

  - Made the column `durationMin` on table `PrivateOffer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `service` on table `PrivateOffer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum - Step 1: Add new enum values
ALTER TYPE "PrivateAdServiceCategory" ADD VALUE IF NOT EXISTS 'VIDEO_CHAT';
ALTER TYPE "PrivateOfferStatus" ADD VALUE IF NOT EXISTS 'OFFER';

-- Must commit enum changes before using them
COMMIT;
BEGIN;

-- AlterTable - Step 2: Use the new enum values
ALTER TABLE "PrivateOffer" ALTER COLUMN "status" SET DEFAULT 'OFFER',
ALTER COLUMN "durationMin" SET NOT NULL,
ALTER COLUMN "service" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_createdAt_idx" ON "ChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "PrivateOffer_chatId_idx" ON "PrivateOffer"("chatId");
