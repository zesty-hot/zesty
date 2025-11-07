/*
  Warnings:

  - You are about to drop the column `roomName` on the `LiveStreamPage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LiveStreamDonation" DROP CONSTRAINT "LiveStreamDonation_streamId_fkey";

-- DropIndex
DROP INDEX "public"."LiveStreamPage_roomName_key";

-- AlterTable
ALTER TABLE "LiveStreamPage" DROP COLUMN "roomName",
ADD COLUMN     "bannerUrl" TEXT;

-- CreateTable
CREATE TABLE "LiveStream" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200),
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "roomName" TEXT NOT NULL,
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "channelId" TEXT NOT NULL,

    CONSTRAINT "LiveStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveStreamFollower" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveStreamFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiveStream_roomName_key" ON "LiveStream"("roomName");

-- CreateIndex
CREATE INDEX "LiveStream_channelId_isLive_idx" ON "LiveStream"("channelId", "isLive");

-- CreateIndex
CREATE INDEX "LiveStream_isLive_startedAt_idx" ON "LiveStream"("isLive", "startedAt");

-- CreateIndex
CREATE INDEX "LiveStreamFollower_channelId_idx" ON "LiveStreamFollower"("channelId");

-- CreateIndex
CREATE INDEX "LiveStreamFollower_userId_idx" ON "LiveStreamFollower"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreamFollower_userId_channelId_key" ON "LiveStreamFollower"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "LiveStream" ADD CONSTRAINT "LiveStream_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LiveStreamPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamFollower" ADD CONSTRAINT "LiveStreamFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamFollower" ADD CONSTRAINT "LiveStreamFollower_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LiveStreamPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamDonation" ADD CONSTRAINT "LiveStreamDonation_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
