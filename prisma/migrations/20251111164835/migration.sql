/*
  Warnings:

  - The primary key for the `zesty_user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `zesty_user` table. All the data in the column will be lost.
  - The required column `zesty_id` was added to the `zesty_user` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."_activeChat" DROP CONSTRAINT "_activeChat_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_hiddenChat" DROP CONSTRAINT "_hiddenChat_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_message" DROP CONSTRAINT "chat_message_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."chat_message_read" DROP CONSTRAINT "chat_message_read_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."dating_pages" DROP CONSTRAINT "dating_pages_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_attendees" DROP CONSTRAINT "event_attendees_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_comments" DROP CONSTRAINT "event_comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."event_posts" DROP CONSTRAINT "event_posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."events" DROP CONSTRAINT "events_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."images" DROP CONSTRAINT "images_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."live_stream_donations" DROP CONSTRAINT "live_stream_donations_donorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."live_stream_followers" DROP CONSTRAINT "live_stream_followers_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."live_stream_pages" DROP CONSTRAINT "live_stream_pages_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."private_ads" DROP CONSTRAINT "private_ads_workerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."private_offers" DROP CONSTRAINT "private_offers_clientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."private_offers" DROP CONSTRAINT "private_offers_workerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."push_subscriptions" DROP CONSTRAINT "push_subscriptions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_revieweeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."reviews" DROP CONSTRAINT "reviews_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studio_admins" DROP CONSTRAINT "studio_admins_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studio_job_applications" DROP CONSTRAINT "studio_job_applications_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studio_reviews" DROP CONSTRAINT "studio_reviews_reviewerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."studios" DROP CONSTRAINT "studios_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_content_comments" DROP CONSTRAINT "vip_content_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_content_likes" DROP CONSTRAINT "vip_content_likes_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_pages" DROP CONSTRAINT "vip_pages_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."vip_subscriptions" DROP CONSTRAINT "vip_subscriptions_subscriberId_fkey";

-- AlterTable
ALTER TABLE "zesty_user" DROP CONSTRAINT "zesty_user_pkey",
DROP COLUMN "id",
ADD COLUMN     "zesty_id" TEXT NOT NULL,
ADD CONSTRAINT "zesty_user_pkey" PRIMARY KEY ("zesty_id");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_pages" ADD CONSTRAINT "vip_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_subscriptions" ADD CONSTRAINT "vip_subscriptions_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_likes" ADD CONSTRAINT "vip_content_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_comments" ADD CONSTRAINT "vip_content_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_ads" ADD CONSTRAINT "private_ads_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "zesty_user"("zesty_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_pages" ADD CONSTRAINT "dating_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_pages" ADD CONSTRAINT "live_stream_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_followers" ADD CONSTRAINT "live_stream_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_donations" ADD CONSTRAINT "live_stream_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "zesty_user"("zesty_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_admins" ADD CONSTRAINT "studio_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_job_applications" ADD CONSTRAINT "studio_job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_reviews" ADD CONSTRAINT "studio_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_B_fkey" FOREIGN KEY ("B") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_B_fkey" FOREIGN KEY ("B") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;
