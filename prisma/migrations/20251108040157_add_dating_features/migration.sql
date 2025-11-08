/*
  Warnings:

  - You are about to drop the column `slug` on the `LiveStreamPage` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LIKE', 'PASS');

-- AlterEnum
ALTER TYPE "PrivateAdExtraType" ADD VALUE 'LIVE_STREAM';

-- DropIndex
DROP INDEX "public"."LiveStreamPage_slug_idx";

-- DropIndex
DROP INDEX "public"."LiveStreamPage_slug_key";

-- AlterTable
ALTER TABLE "LiveStreamPage" DROP COLUMN "slug";

-- CreateTable
CREATE TABLE "DatingPage" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ageRangeMin" INTEGER NOT NULL DEFAULT 18,
    "ageRangeMax" INTEGER NOT NULL DEFAULT 100,
    "maxDistance" INTEGER NOT NULL DEFAULT 50,
    "showGender" "Gender"[] DEFAULT ARRAY[]::"Gender"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatingPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatingSwipe" (
    "id" TEXT NOT NULL,
    "swiperId" TEXT NOT NULL,
    "swipedId" TEXT NOT NULL,
    "direction" "SwipeDirection" NOT NULL,
    "superLike" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatingSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatingMatch" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "chatId" TEXT,
    "unmatchedBy" TEXT,
    "unmatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatingMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DatingPage_active_createdAt_idx" ON "DatingPage"("active", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DatingPage_userId_key" ON "DatingPage"("userId");

-- CreateIndex
CREATE INDEX "DatingSwipe_swiperId_createdAt_idx" ON "DatingSwipe"("swiperId", "createdAt");

-- CreateIndex
CREATE INDEX "DatingSwipe_swipedId_direction_idx" ON "DatingSwipe"("swipedId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "DatingSwipe_swiperId_swipedId_key" ON "DatingSwipe"("swiperId", "swipedId");

-- CreateIndex
CREATE UNIQUE INDEX "DatingMatch_chatId_key" ON "DatingMatch"("chatId");

-- CreateIndex
CREATE INDEX "DatingMatch_user1Id_createdAt_idx" ON "DatingMatch"("user1Id", "createdAt");

-- CreateIndex
CREATE INDEX "DatingMatch_user2Id_createdAt_idx" ON "DatingMatch"("user2Id", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DatingMatch_user1Id_user2Id_key" ON "DatingMatch"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "DatingPage" ADD CONSTRAINT "DatingPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingSwipe" ADD CONSTRAINT "DatingSwipe_swiperId_fkey" FOREIGN KEY ("swiperId") REFERENCES "DatingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingSwipe" ADD CONSTRAINT "DatingSwipe_swipedId_fkey" FOREIGN KEY ("swipedId") REFERENCES "DatingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingMatch" ADD CONSTRAINT "DatingMatch_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "DatingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingMatch" ADD CONSTRAINT "DatingMatch_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "DatingPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatingMatch" ADD CONSTRAINT "DatingMatch_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
