/*
  Warnings:

  - You are about to drop the column `userId` on the `chat_message_read` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `dating_pages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `event_attendees` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `live_stream_followers` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `live_stream_pages` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `push_subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `studio_admins` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `vip_content_comments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `vip_content_likes` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `vip_pages` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `zesty_user` table. All the data in the column will be lost.
  - You are about to drop the `chat` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[messageId,zesty_id]` on the table `chat_message_read` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zesty_id]` on the table `dating_pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,zesty_id]` on the table `event_attendees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zesty_id,channelId]` on the table `live_stream_followers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zesty_id]` on the table `live_stream_pages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studioId,zesty_id]` on the table `studio_admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zesty_id,contentId]` on the table `vip_content_likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[zesty_id]` on the table `vip_pages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `zesty_id` to the `chat_message_read` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `dating_pages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `event_attendees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `live_stream_followers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `live_stream_pages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `push_subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `studio_admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `vip_content_comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `vip_content_likes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zesty_id` to the `vip_pages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "private_ad_service_category" ADD VALUE 'MODELLING';

-- DropForeignKey
ALTER TABLE "public"."_activeChat" DROP CONSTRAINT "_activeChat_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_hiddenChat" DROP CONSTRAINT "_hiddenChat_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_message" DROP CONSTRAINT "chat_message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_message_read" DROP CONSTRAINT "chat_message_read_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dating_matches" DROP CONSTRAINT "dating_matches_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dating_pages" DROP CONSTRAINT "dating_pages_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_attendees" DROP CONSTRAINT "event_attendees_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."images" DROP CONSTRAINT "images_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."live_stream_followers" DROP CONSTRAINT "live_stream_followers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."live_stream_pages" DROP CONSTRAINT "live_stream_pages_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."private_offers" DROP CONSTRAINT "private_offers_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."push_subscriptions" DROP CONSTRAINT "push_subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studio_admins" DROP CONSTRAINT "studio_admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_content_comments" DROP CONSTRAINT "vip_content_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_content_likes" DROP CONSTRAINT "vip_content_likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_pages" DROP CONSTRAINT "vip_pages_userId_fkey";

-- DropIndex
DROP INDEX "public"."chat_message_read_messageId_userId_key";

-- DropIndex
DROP INDEX "public"."chat_message_read_userId_idx";

-- DropIndex
DROP INDEX "public"."dating_pages_userId_key";

-- DropIndex
DROP INDEX "public"."event_attendees_eventId_userId_key";

-- DropIndex
DROP INDEX "public"."event_attendees_userId_idx";

-- DropIndex
DROP INDEX "public"."images_userId_idx";

-- DropIndex
DROP INDEX "public"."live_stream_followers_userId_channelId_key";

-- DropIndex
DROP INDEX "public"."live_stream_followers_userId_idx";

-- DropIndex
DROP INDEX "public"."live_stream_pages_userId_key";

-- DropIndex
DROP INDEX "public"."push_subscriptions_userId_active_idx";

-- DropIndex
DROP INDEX "public"."studio_admins_studioId_userId_key";

-- DropIndex
DROP INDEX "public"."studio_admins_userId_idx";

-- DropIndex
DROP INDEX "public"."vip_content_likes_userId_contentId_key";

-- DropIndex
DROP INDEX "public"."vip_pages_userId_key";

-- AlterTable
ALTER TABLE "chat_message_read" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dating_pages" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "event_attendees" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "images" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT;

-- AlterTable
ALTER TABLE "live_stream_followers" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "live_stream_pages" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "push_subscriptions" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "studio_admins" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vip_content_comments" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vip_content_likes" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vip_pages" DROP COLUMN "userId",
ADD COLUMN     "zesty_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "zesty_user" DROP COLUMN "role",
ADD COLUMN     "webRole" "role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."chat";

-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_message_read_zesty_id_idx" ON "chat_message_read"("zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_messageId_zesty_id_key" ON "chat_message_read"("messageId", "zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "dating_pages_zesty_id_key" ON "dating_pages"("zesty_id");

-- CreateIndex
CREATE INDEX "event_attendees_zesty_id_idx" ON "event_attendees"("zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_zesty_id_key" ON "event_attendees"("eventId", "zesty_id");

-- CreateIndex
CREATE INDEX "images_zesty_id_idx" ON "images"("zesty_id");

-- CreateIndex
CREATE INDEX "live_stream_followers_zesty_id_idx" ON "live_stream_followers"("zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_stream_followers_zesty_id_channelId_key" ON "live_stream_followers"("zesty_id", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "live_stream_pages_zesty_id_key" ON "live_stream_pages"("zesty_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_zesty_id_active_idx" ON "push_subscriptions"("zesty_id", "active");

-- CreateIndex
CREATE INDEX "studio_admins_zesty_id_idx" ON "studio_admins"("zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "studio_admins_studioId_zesty_id_key" ON "studio_admins"("studioId", "zesty_id");

-- CreateIndex
CREATE UNIQUE INDEX "vip_content_likes_zesty_id_contentId_key" ON "vip_content_likes"("zesty_id", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "vip_pages_zesty_id_key" ON "vip_pages"("zesty_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_pages" ADD CONSTRAINT "vip_pages_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_likes" ADD CONSTRAINT "vip_content_likes_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_comments" ADD CONSTRAINT "vip_content_comments_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_pages" ADD CONSTRAINT "dating_pages_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_matches" ADD CONSTRAINT "dating_matches_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_pages" ADD CONSTRAINT "live_stream_pages_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_followers" ADD CONSTRAINT "live_stream_followers_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_admins" ADD CONSTRAINT "studio_admins_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_zesty_id_fkey" FOREIGN KEY ("zesty_id") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
