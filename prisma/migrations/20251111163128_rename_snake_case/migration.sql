-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'STAFF', 'USER');

-- CreateEnum
CREATE TYPE "race" AS ENUM ('ASIAN', 'AFRICAN', 'HISPANIC', 'WHITE', 'DESI', 'ARABIC');

-- CreateEnum
CREATE TYPE "body_type" AS ENUM ('REGULAR', 'PLUS', 'ATHLETE');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE', 'TRANS');

-- CreateEnum
CREATE TYPE "vip_content_type" AS ENUM ('IMAGE', 'VIDEO', 'STATUS');

-- CreateEnum
CREATE TYPE "private_ad_extra_type" AS ENUM ('FILMING', 'BJ', 'ANAL', 'BDSM', 'NATURAL', 'EXTRA_PERSON', 'OUTSIDE_LOCATION', 'COSTUME', 'ROLEPLAY', 'TOY_USE', 'CREAMPIE', 'GOLDEN_SHOWER', 'LIVE_STREAM');

-- CreateEnum
CREATE TYPE "private_ad_customer_category" AS ENUM ('MEN', 'WOMEN', 'GROUPS', 'TRANSGENDER', 'DISABLED');

-- CreateEnum
CREATE TYPE "private_ad_service_category" AS ENUM ('MEET_AND_GREET', 'MASSAGE', 'IN_CALL', 'OUT_CALL', 'VIDEO_CHAT');

-- CreateEnum
CREATE TYPE "private_ad_days_available" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "private_offer_status" AS ENUM ('OFFER', 'PENDING', 'CONFIRMED', 'DISPUTED', 'RELEASED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "dating_swipe_direction" AS ENUM ('LIKE', 'PASS');

-- CreateEnum
CREATE TYPE "event_status" AS ENUM ('OPEN', 'INVITE_ONLY', 'PAY_TO_JOIN', 'REQUEST_TO_JOIN');

-- CreateEnum
CREATE TYPE "event_attendee_status" AS ENUM ('PENDING', 'GOING', 'MAYBE', 'DECLINED', 'INVITED');

-- CreateEnum
CREATE TYPE "job_type" AS ENUM ('ACTOR', 'DIRECTOR', 'CAMERA_OPERATOR', 'EDITOR', 'PRODUCTION_STAFF', 'MODEL', 'OTHER');

-- CreateEnum
CREATE TYPE "job_status" AS ENUM ('OPEN', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "application_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "altText" TEXT,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "NSFW" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zesty_user" (
    "id" TEXT NOT NULL,
    "supabaseId" TEXT NOT NULL,
    "title" VARCHAR(200),
    "bio" VARCHAR(1000),
    "slug" TEXT,
    "role" "role" NOT NULL DEFAULT 'USER',
    "dob" TIMESTAMP(3),
    "stripeId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(100),
    "suburb" VARCHAR(100),
    "bodyType" "body_type",
    "race" "race",
    "gender" "gender",
    "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "zesty_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_pages" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "bannerUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionPrice" INTEGER NOT NULL DEFAULT 999,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_content" (
    "id" TEXT NOT NULL,
    "type" "vip_content_type" NOT NULL,
    "caption" VARCHAR(1000),
    "imageUrl" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "statusText" VARCHAR(5000),
    "NSFW" BOOLEAN NOT NULL DEFAULT false,
    "vipPageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_subscriptions" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "vipPageId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "amountPaid" INTEGER NOT NULL,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_discount_offers" (
    "id" TEXT NOT NULL,
    "vipPageId" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "discountedPrice" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vip_discount_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_content_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vip_content_likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vip_content_comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vip_content_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "comment" VARCHAR(1000),
    "rating" SMALLINT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "offerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_ad_services" (
    "id" TEXT NOT NULL,
    "privateAdId" TEXT NOT NULL,
    "category" "private_ad_service_category" NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_ad_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_ad_service_options" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "private_ad_service_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_ad_extras" (
    "id" TEXT NOT NULL,
    "privateAdId" TEXT NOT NULL,
    "name" "private_ad_extra_type" NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "private_ad_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_ads" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "acceptsGender" "private_ad_customer_category"[],
    "acceptsRace" "race"[],
    "acceptsBodyType" "body_type"[],
    "acceptsAgeRange" INTEGER[],
    "daysAvailable" "private_ad_days_available"[],
    "workerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "private_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "private_offers" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "adId" TEXT NOT NULL,
    "service" "private_ad_service_category" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "extras" TEXT[],
    "scheduledFor" TIMESTAMP(3),
    "dayRequested" "private_ad_days_available",
    "isAsap" BOOLEAN NOT NULL DEFAULT false,
    "status" "private_offer_status" NOT NULL DEFAULT 'OFFER',
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "disputeReason" VARCHAR(1000),
    "disputeRaisedAt" TIMESTAMP(3),
    "disputeResolvedAt" TIMESTAMP(3),
    "creditFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "platformFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "clientId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "chatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "private_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_message_read" (
    "id" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_read_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dating_pages" (
    "id" TEXT NOT NULL,
    "lookingFor" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ageRangeMin" INTEGER NOT NULL DEFAULT 18,
    "ageRangeMax" INTEGER NOT NULL DEFAULT 100,
    "maxDistance" INTEGER NOT NULL DEFAULT 50,
    "showGender" "gender"[] DEFAULT ARRAY[]::"gender"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dating_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dating_swipes" (
    "id" TEXT NOT NULL,
    "swiperId" TEXT NOT NULL,
    "swipedId" TEXT NOT NULL,
    "direction" "dating_swipe_direction" NOT NULL,
    "superLike" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dating_swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dating_matches" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "chatId" TEXT,
    "unmatchedBy" TEXT,
    "unmatchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dating_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_stream_pages" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(3000),
    "bannerUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "ingressId" TEXT,
    "streamKey" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_stream_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_streams" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200),
    "isLive" BOOLEAN NOT NULL DEFAULT true,
    "roomName" TEXT NOT NULL,
    "viewerCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "channelId" TEXT NOT NULL,

    CONSTRAINT "live_streams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_stream_followers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_stream_followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_stream_donations" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" VARCHAR(500),
    "donorId" TEXT,
    "streamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "live_stream_donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "location" VARCHAR(100),
    "suburb" VARCHAR(100),
    "venue" VARCHAR(200),
    "coverImage" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "status" "event_status" NOT NULL DEFAULT 'OPEN',
    "price" INTEGER,
    "maxAttendees" INTEGER,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "status" "event_attendee_status" NOT NULL DEFAULT 'PENDING',
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studios" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "coverImage" TEXT,
    "location" VARCHAR(100),
    "suburb" VARCHAR(100),
    "website" VARCHAR(200),
    "email" VARCHAR(100),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_admins" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canPostJobs" BOOLEAN NOT NULL DEFAULT true,
    "canManageJobs" BOOLEAN NOT NULL DEFAULT true,
    "canInviteAdmins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "studio_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_jobs" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "job_type" NOT NULL,
    "payAmount" INTEGER NOT NULL,
    "payType" TEXT NOT NULL DEFAULT 'FIXED',
    "lengthHours" INTEGER,
    "lengthDays" INTEGER,
    "location" VARCHAR(100),
    "suburb" VARCHAR(100),
    "venue" VARCHAR(200),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "requirements" TEXT,
    "coverImage" TEXT,
    "status" "job_status" NOT NULL DEFAULT 'OPEN',
    "maxApplicants" INTEGER,
    "studioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_job_applications" (
    "id" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "application_status" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studio_reviews" (
    "id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" VARCHAR(1000),
    "wouldWorkAgain" BOOLEAN NOT NULL DEFAULT true,
    "studioId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_activeChat" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_activeChat_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_hiddenChat" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_hiddenChat_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "images_userId_idx" ON "images"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "zesty_user_supabaseId_key" ON "zesty_user"("supabaseId");

-- CreateIndex
CREATE UNIQUE INDEX "zesty_user_slug_key" ON "zesty_user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "vip_pages_userId_key" ON "vip_pages"("userId");

-- CreateIndex
CREATE INDEX "vip_content_vipPageId_createdAt_idx" ON "vip_content"("vipPageId", "createdAt");

-- CreateIndex
CREATE INDEX "vip_subscriptions_subscriberId_idx" ON "vip_subscriptions"("subscriberId");

-- CreateIndex
CREATE INDEX "vip_subscriptions_vipPageId_idx" ON "vip_subscriptions"("vipPageId");

-- CreateIndex
CREATE UNIQUE INDEX "vip_subscriptions_subscriberId_vipPageId_key" ON "vip_subscriptions"("subscriberId", "vipPageId");

-- CreateIndex
CREATE INDEX "vip_discount_offers_vipPageId_active_idx" ON "vip_discount_offers"("vipPageId", "active");

-- CreateIndex
CREATE INDEX "vip_content_likes_contentId_idx" ON "vip_content_likes"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "vip_content_likes_userId_contentId_key" ON "vip_content_likes"("userId", "contentId");

-- CreateIndex
CREATE INDEX "vip_content_comments_contentId_createdAt_idx" ON "vip_content_comments"("contentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "private_ad_services_privateAdId_category_key" ON "private_ad_services"("privateAdId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "private_ads_workerId_key" ON "private_ads"("workerId");

-- CreateIndex
CREATE INDEX "private_offers_clientId_status_idx" ON "private_offers"("clientId", "status");

-- CreateIndex
CREATE INDEX "private_offers_workerId_status_idx" ON "private_offers"("workerId", "status");

-- CreateIndex
CREATE INDEX "private_offers_status_completedAt_idx" ON "private_offers"("status", "completedAt");

-- CreateIndex
CREATE INDEX "private_offers_chatId_idx" ON "private_offers"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_slug_key" ON "chat_message"("slug");

-- CreateIndex
CREATE INDEX "chat_message_chatId_createdAt_idx" ON "chat_message"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "chat_message_senderId_idx" ON "chat_message"("senderId");

-- CreateIndex
CREATE INDEX "chat_message_read_userId_idx" ON "chat_message_read"("userId");

-- CreateIndex
CREATE INDEX "chat_message_read_messageId_idx" ON "chat_message_read"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_messageId_userId_key" ON "chat_message_read"("messageId", "userId");

-- CreateIndex
CREATE INDEX "dating_pages_active_createdAt_idx" ON "dating_pages"("active", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "dating_pages_userId_key" ON "dating_pages"("userId");

-- CreateIndex
CREATE INDEX "dating_swipes_swiperId_createdAt_idx" ON "dating_swipes"("swiperId", "createdAt");

-- CreateIndex
CREATE INDEX "dating_swipes_swipedId_direction_idx" ON "dating_swipes"("swipedId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "dating_swipes_swiperId_swipedId_key" ON "dating_swipes"("swiperId", "swipedId");

-- CreateIndex
CREATE UNIQUE INDEX "dating_matches_chatId_key" ON "dating_matches"("chatId");

-- CreateIndex
CREATE INDEX "dating_matches_user1Id_createdAt_idx" ON "dating_matches"("user1Id", "createdAt");

-- CreateIndex
CREATE INDEX "dating_matches_user2Id_createdAt_idx" ON "dating_matches"("user2Id", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "dating_matches_user1Id_user2Id_key" ON "dating_matches"("user1Id", "user2Id");

-- CreateIndex
CREATE INDEX "live_stream_pages_active_createdAt_idx" ON "live_stream_pages"("active", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "live_stream_pages_userId_key" ON "live_stream_pages"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "live_streams_roomName_key" ON "live_streams"("roomName");

-- CreateIndex
CREATE INDEX "live_streams_channelId_isLive_idx" ON "live_streams"("channelId", "isLive");

-- CreateIndex
CREATE INDEX "live_streams_isLive_startedAt_idx" ON "live_streams"("isLive", "startedAt");

-- CreateIndex
CREATE INDEX "live_stream_followers_channelId_idx" ON "live_stream_followers"("channelId");

-- CreateIndex
CREATE INDEX "live_stream_followers_userId_idx" ON "live_stream_followers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "live_stream_followers_userId_channelId_key" ON "live_stream_followers"("userId", "channelId");

-- CreateIndex
CREATE INDEX "live_stream_donations_streamId_createdAt_idx" ON "live_stream_donations"("streamId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE INDEX "events_organizerId_idx" ON "events"("organizerId");

-- CreateIndex
CREATE INDEX "events_startTime_idx" ON "events"("startTime");

-- CreateIndex
CREATE INDEX "events_suburb_startTime_idx" ON "events"("suburb", "startTime");

-- CreateIndex
CREATE INDEX "events_status_startTime_idx" ON "events"("status", "startTime");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_status_idx" ON "event_attendees"("eventId", "status");

-- CreateIndex
CREATE INDEX "event_attendees_userId_idx" ON "event_attendees"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_eventId_userId_key" ON "event_attendees"("eventId", "userId");

-- CreateIndex
CREATE INDEX "event_posts_eventId_createdAt_idx" ON "event_posts"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "event_posts_authorId_idx" ON "event_posts"("authorId");

-- CreateIndex
CREATE INDEX "event_comments_postId_createdAt_idx" ON "event_comments"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "event_comments_authorId_idx" ON "event_comments"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "studios_slug_key" ON "studios"("slug");

-- CreateIndex
CREATE INDEX "studios_ownerId_idx" ON "studios"("ownerId");

-- CreateIndex
CREATE INDEX "studios_slug_idx" ON "studios"("slug");

-- CreateIndex
CREATE INDEX "studios_active_createdAt_idx" ON "studios"("active", "createdAt");

-- CreateIndex
CREATE INDEX "studios_suburb_idx" ON "studios"("suburb");

-- CreateIndex
CREATE INDEX "studio_admins_studioId_idx" ON "studio_admins"("studioId");

-- CreateIndex
CREATE INDEX "studio_admins_userId_idx" ON "studio_admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "studio_admins_studioId_userId_key" ON "studio_admins"("studioId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "studio_jobs_slug_key" ON "studio_jobs"("slug");

-- CreateIndex
CREATE INDEX "studio_jobs_studioId_idx" ON "studio_jobs"("studioId");

-- CreateIndex
CREATE INDEX "studio_jobs_slug_idx" ON "studio_jobs"("slug");

-- CreateIndex
CREATE INDEX "studio_jobs_status_startDate_idx" ON "studio_jobs"("status", "startDate");

-- CreateIndex
CREATE INDEX "studio_jobs_type_status_idx" ON "studio_jobs"("type", "status");

-- CreateIndex
CREATE INDEX "studio_jobs_suburb_status_idx" ON "studio_jobs"("suburb", "status");

-- CreateIndex
CREATE INDEX "studio_job_applications_jobId_status_idx" ON "studio_job_applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "studio_job_applications_applicantId_idx" ON "studio_job_applications"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "studio_job_applications_jobId_applicantId_key" ON "studio_job_applications"("jobId", "applicantId");

-- CreateIndex
CREATE INDEX "studio_reviews_studioId_createdAt_idx" ON "studio_reviews"("studioId", "createdAt");

-- CreateIndex
CREATE INDEX "studio_reviews_reviewerId_idx" ON "studio_reviews"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_userId_active_idx" ON "push_subscriptions"("userId", "active");

-- CreateIndex
CREATE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "_activeChat_B_index" ON "_activeChat"("B");

-- CreateIndex
CREATE INDEX "_hiddenChat_B_index" ON "_hiddenChat"("B");

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_pages" ADD CONSTRAINT "vip_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content" ADD CONSTRAINT "vip_content_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "vip_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_subscriptions" ADD CONSTRAINT "vip_subscriptions_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_subscriptions" ADD CONSTRAINT "vip_subscriptions_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "vip_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_discount_offers" ADD CONSTRAINT "vip_discount_offers_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "vip_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_likes" ADD CONSTRAINT "vip_content_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_likes" ADD CONSTRAINT "vip_content_likes_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "vip_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_comments" ADD CONSTRAINT "vip_content_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vip_content_comments" ADD CONSTRAINT "vip_content_comments_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "vip_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "private_offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_ad_services" ADD CONSTRAINT "private_ad_services_privateAdId_fkey" FOREIGN KEY ("privateAdId") REFERENCES "private_ads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_ad_service_options" ADD CONSTRAINT "private_ad_service_options_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "private_ad_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_ad_extras" ADD CONSTRAINT "private_ad_extras_privateAdId_fkey" FOREIGN KEY ("privateAdId") REFERENCES "private_ads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_ads" ADD CONSTRAINT "private_ads_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "private_offers" ADD CONSTRAINT "private_offers_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "zesty_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_message_read" ADD CONSTRAINT "chat_message_read_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_pages" ADD CONSTRAINT "dating_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_swipes" ADD CONSTRAINT "dating_swipes_swiperId_fkey" FOREIGN KEY ("swiperId") REFERENCES "dating_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_swipes" ADD CONSTRAINT "dating_swipes_swipedId_fkey" FOREIGN KEY ("swipedId") REFERENCES "dating_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_matches" ADD CONSTRAINT "dating_matches_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "dating_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_matches" ADD CONSTRAINT "dating_matches_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "dating_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dating_matches" ADD CONSTRAINT "dating_matches_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_pages" ADD CONSTRAINT "live_stream_pages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "live_stream_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_followers" ADD CONSTRAINT "live_stream_followers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_followers" ADD CONSTRAINT "live_stream_followers_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "live_stream_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_donations" ADD CONSTRAINT "live_stream_donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "zesty_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_stream_donations" ADD CONSTRAINT "live_stream_donations_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "live_streams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_posts" ADD CONSTRAINT "event_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "event_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_comments" ADD CONSTRAINT "event_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studios" ADD CONSTRAINT "studios_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_admins" ADD CONSTRAINT "studio_admins_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_admins" ADD CONSTRAINT "studio_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_jobs" ADD CONSTRAINT "studio_jobs_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_job_applications" ADD CONSTRAINT "studio_job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "studio_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_job_applications" ADD CONSTRAINT "studio_job_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_reviews" ADD CONSTRAINT "studio_reviews_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "studios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studio_reviews" ADD CONSTRAINT "studio_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_A_fkey" FOREIGN KEY ("A") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_B_fkey" FOREIGN KEY ("B") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_A_fkey" FOREIGN KEY ("A") REFERENCES "chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_B_fkey" FOREIGN KEY ("B") REFERENCES "zesty_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
