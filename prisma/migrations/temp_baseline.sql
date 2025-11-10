-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STAFF', 'USER');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('ASIAN', 'AFRICAN', 'HISPANIC', 'WHITE', 'DESI', 'ARABIC');

-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('REGULAR', 'PLUS', 'ATHLETE');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'TRANS');

-- CreateEnum
CREATE TYPE "VIPContentType" AS ENUM ('IMAGE', 'VIDEO', 'STATUS');

-- CreateEnum
CREATE TYPE "PrivateAdExtraType" AS ENUM ('FILMING', 'BJ', 'ANAL', 'BDSM', 'NATURAL', 'EXTRA_PERSON', 'OUTSIDE_LOCATION', 'COSTUME', 'ROLEPLAY', 'TOY_USE', 'CREAMPIE', 'GOLDEN_SHOWER', 'LIVE_STREAM');

-- CreateEnum
CREATE TYPE "PrivateAdCustomerCategory" AS ENUM ('MEN', 'WOMEN', 'GROUPS', 'TRANSGENDER', 'DISABLED');

-- CreateEnum
CREATE TYPE "PrivateAdServiceCategory" AS ENUM ('MEET_AND_GREET', 'MASSAGE', 'IN_CALL', 'OUT_CALL', 'VIDEO_CHAT');

-- CreateEnum
CREATE TYPE "DaysAvailable" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "PrivateOfferStatus" AS ENUM ('OFFER', 'PENDING', 'CONFIRMED', 'DISPUTED', 'RELEASED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SwipeDirection" AS ENUM ('LIKE', 'PASS');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('OPEN', 'INVITE_ONLY', 'PAY_TO_JOIN', 'REQUEST_TO_JOIN');

-- CreateEnum
CREATE TYPE "EventAttendeeStatus" AS ENUM ('PENDING', 'GOING', 'MAYBE', 'DECLINED', 'INVITED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('ACTOR', 'DIRECTOR', 'CAMERA_OPERATOR', 'EDITOR', 'PRODUCTION_STAFF', 'MODEL', 'OTHER');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "altText" TEXT,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "NSFW" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "title" VARCHAR(200),
    "bio" VARCHAR(1000),
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "slug" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "dob" TIMESTAMP(3),
    "stripeId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mobile" VARCHAR(15),
    "location" VARCHAR(100),
    "suburb" VARCHAR(100),
    "bodyType" "BodyType",
    "race" "Race",
    "gender" "Gender",
    "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPPage" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "bannerUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionPrice" INTEGER NOT NULL DEFAULT 999,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VIPPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPContent" (
    "id" TEXT NOT NULL,
    "type" "VIPContentType" NOT NULL,
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

    CONSTRAINT "VIPContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPSubscription" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "vipPageId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "amountPaid" INTEGER NOT NULL,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VIPSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPDiscountOffer" (
    "id" TEXT NOT NULL,
    "vipPageId" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "discountedPrice" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VIPDiscountOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPLike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VIPLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VIPComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "text" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VIPComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "comment" VARCHAR(1000),
    "rating" SMALLINT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "offerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PrivateAdService" (
    "id" TEXT NOT NULL,
    "privateAdId" TEXT NOT NULL,
    "category" "PrivateAdServiceCategory" NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateAdService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceOption" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "ServiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateAdExtra" (
    "id" TEXT NOT NULL,
    "privateAdId" TEXT NOT NULL,
    "name" "PrivateAdExtraType" NOT NULL,
    "price" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrivateAdExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateAd" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(3000) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "acceptsGender" "PrivateAdCustomerCategory"[],
    "acceptsRace" "Race"[],
    "acceptsBodyType" "BodyType"[],
    "acceptsAgeRange" INTEGER[],
    "daysAvailable" "DaysAvailable"[],
    "workerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrivateAd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateOffer" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "adId" TEXT NOT NULL,
    "service" "PrivateAdServiceCategory" NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "extras" TEXT[],
    "scheduledFor" TIMESTAMP(3),
    "dayRequested" "DaysAvailable",
    "isAsap" BOOLEAN NOT NULL DEFAULT false,
    "status" "PrivateOfferStatus" NOT NULL DEFAULT 'OFFER',
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

    CONSTRAINT "PrivateOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatingPage" (
    "id" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "LiveStreamPage" (
    "id" TEXT NOT NULL,
    "description" VARCHAR(3000),
    "bannerUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "ingressId" TEXT,
    "streamKey" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveStreamPage_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "LiveStreamDonation" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "message" VARCHAR(500),
    "donorId" TEXT,
    "streamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveStreamDonation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
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
    "status" "EventStatus" NOT NULL DEFAULT 'OPEN',
    "price" INTEGER,
    "maxAttendees" INTEGER,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendee" (
    "id" TEXT NOT NULL,
    "status" "EventAttendeeStatus" NOT NULL DEFAULT 'PENDING',
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventAttendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPost" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Studio" (
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

    CONSTRAINT "Studio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioAdmin" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canPostJobs" BOOLEAN NOT NULL DEFAULT true,
    "canManageJobs" BOOLEAN NOT NULL DEFAULT true,
    "canInviteAdmins" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
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
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "maxApplicants" INTEGER,
    "studioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioReview" (
    "id" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" VARCHAR(1000),
    "wouldWorkAgain" BOOLEAN NOT NULL DEFAULT true,
    "studioId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "images_userId_idx" ON "Images"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VIPPage_userId_key" ON "VIPPage"("userId");

-- CreateIndex
CREATE INDEX "VIPContent_vipPageId_createdAt_idx" ON "VIPContent"("vipPageId", "createdAt");

-- CreateIndex
CREATE INDEX "VIPSubscription_subscriberId_idx" ON "VIPSubscription"("subscriberId");

-- CreateIndex
CREATE INDEX "VIPSubscription_vipPageId_idx" ON "VIPSubscription"("vipPageId");

-- CreateIndex
CREATE UNIQUE INDEX "VIPSubscription_subscriberId_vipPageId_key" ON "VIPSubscription"("subscriberId", "vipPageId");

-- CreateIndex
CREATE INDEX "VIPDiscountOffer_vipPageId_active_idx" ON "VIPDiscountOffer"("vipPageId", "active");

-- CreateIndex
CREATE INDEX "VIPLike_contentId_idx" ON "VIPLike"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "VIPLike_userId_contentId_key" ON "VIPLike"("userId", "contentId");

-- CreateIndex
CREATE INDEX "VIPComment_contentId_createdAt_idx" ON "VIPComment"("contentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateAdService_privateAdId_category_key" ON "PrivateAdService"("privateAdId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "PrivateAd_workerId_key" ON "PrivateAd"("workerId");

-- CreateIndex
CREATE INDEX "PrivateOffer_clientId_status_idx" ON "PrivateOffer"("clientId", "status");

-- CreateIndex
CREATE INDEX "PrivateOffer_workerId_status_idx" ON "PrivateOffer"("workerId", "status");

-- CreateIndex
CREATE INDEX "PrivateOffer_status_completedAt_idx" ON "PrivateOffer"("status", "completedAt");

-- CreateIndex
CREATE INDEX "PrivateOffer_chatId_idx" ON "PrivateOffer"("chatId");

-- CreateIndex
CREATE INDEX "ChatMessage_chatId_createdAt_idx" ON "ChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "MessageRead_userId_idx" ON "MessageRead"("userId");

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "MessageRead"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "MessageRead"("messageId", "userId");

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

-- CreateIndex
CREATE INDEX "LiveStreamPage_active_createdAt_idx" ON "LiveStreamPage"("active", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreamPage_userId_key" ON "LiveStreamPage"("userId");

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

-- CreateIndex
CREATE INDEX "LiveStreamDonation_streamId_createdAt_idx" ON "LiveStreamDonation"("streamId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");

-- CreateIndex
CREATE INDEX "Event_startTime_idx" ON "Event"("startTime");

-- CreateIndex
CREATE INDEX "Event_suburb_startTime_idx" ON "Event"("suburb", "startTime");

-- CreateIndex
CREATE INDEX "Event_status_startTime_idx" ON "Event"("status", "startTime");

-- CreateIndex
CREATE INDEX "EventAttendee_eventId_status_idx" ON "EventAttendee"("eventId", "status");

-- CreateIndex
CREATE INDEX "EventAttendee_userId_idx" ON "EventAttendee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAttendee_eventId_userId_key" ON "EventAttendee"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventPost_eventId_createdAt_idx" ON "EventPost"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventPost_authorId_idx" ON "EventPost"("authorId");

-- CreateIndex
CREATE INDEX "EventComment_postId_createdAt_idx" ON "EventComment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "EventComment_authorId_idx" ON "EventComment"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

-- CreateIndex
CREATE INDEX "Studio_ownerId_idx" ON "Studio"("ownerId");

-- CreateIndex
CREATE INDEX "Studio_slug_idx" ON "Studio"("slug");

-- CreateIndex
CREATE INDEX "Studio_active_createdAt_idx" ON "Studio"("active", "createdAt");

-- CreateIndex
CREATE INDEX "Studio_suburb_idx" ON "Studio"("suburb");

-- CreateIndex
CREATE INDEX "StudioAdmin_studioId_idx" ON "StudioAdmin"("studioId");

-- CreateIndex
CREATE INDEX "StudioAdmin_userId_idx" ON "StudioAdmin"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioAdmin_studioId_userId_key" ON "StudioAdmin"("studioId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_studioId_idx" ON "Job"("studioId");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_startDate_idx" ON "Job"("status", "startDate");

-- CreateIndex
CREATE INDEX "Job_type_status_idx" ON "Job"("type", "status");

-- CreateIndex
CREATE INDEX "Job_suburb_status_idx" ON "Job"("suburb", "status");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_status_idx" ON "JobApplication"("jobId", "status");

-- CreateIndex
CREATE INDEX "JobApplication_applicantId_idx" ON "JobApplication"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_applicantId_key" ON "JobApplication"("jobId", "applicantId");

-- CreateIndex
CREATE INDEX "StudioReview_studioId_createdAt_idx" ON "StudioReview"("studioId", "createdAt");

-- CreateIndex
CREATE INDEX "StudioReview_reviewerId_idx" ON "StudioReview"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_active_idx" ON "PushSubscription"("userId", "active");

-- CreateIndex
CREATE INDEX "PushSubscription_endpoint_idx" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "_activeChat_B_index" ON "_activeChat"("B");

-- CreateIndex
CREATE INDEX "_hiddenChat_B_index" ON "_hiddenChat"("B");

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPPage" ADD CONSTRAINT "VIPPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPContent" ADD CONSTRAINT "VIPContent_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "VIPPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPSubscription" ADD CONSTRAINT "VIPSubscription_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPSubscription" ADD CONSTRAINT "VIPSubscription_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "VIPPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPDiscountOffer" ADD CONSTRAINT "VIPDiscountOffer_vipPageId_fkey" FOREIGN KEY ("vipPageId") REFERENCES "VIPPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPLike" ADD CONSTRAINT "VIPLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPLike" ADD CONSTRAINT "VIPLike_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "VIPContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPComment" ADD CONSTRAINT "VIPComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VIPComment" ADD CONSTRAINT "VIPComment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "VIPContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "PrivateOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateAdService" ADD CONSTRAINT "PrivateAdService_privateAdId_fkey" FOREIGN KEY ("privateAdId") REFERENCES "PrivateAd"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOption" ADD CONSTRAINT "ServiceOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "PrivateAdService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateAdExtra" ADD CONSTRAINT "PrivateAdExtra_privateAdId_fkey" FOREIGN KEY ("privateAdId") REFERENCES "PrivateAd"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateAd" ADD CONSTRAINT "PrivateAd_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateOffer" ADD CONSTRAINT "PrivateOffer_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateOffer" ADD CONSTRAINT "PrivateOffer_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateOffer" ADD CONSTRAINT "PrivateOffer_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "LiveStreamPage" ADD CONSTRAINT "LiveStreamPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStream" ADD CONSTRAINT "LiveStream_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LiveStreamPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamFollower" ADD CONSTRAINT "LiveStreamFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamFollower" ADD CONSTRAINT "LiveStreamFollower_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "LiveStreamPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamDonation" ADD CONSTRAINT "LiveStreamDonation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamDonation" ADD CONSTRAINT "LiveStreamDonation_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStream"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendee" ADD CONSTRAINT "EventAttendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPost" ADD CONSTRAINT "EventPost_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPost" ADD CONSTRAINT "EventPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "EventPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventComment" ADD CONSTRAINT "EventComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Studio" ADD CONSTRAINT "Studio_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAdmin" ADD CONSTRAINT "StudioAdmin_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioAdmin" ADD CONSTRAINT "StudioAdmin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioReview" ADD CONSTRAINT "StudioReview_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioReview" ADD CONSTRAINT "StudioReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_activeChat" ADD CONSTRAINT "_activeChat_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_A_fkey" FOREIGN KEY ("A") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_hiddenChat" ADD CONSTRAINT "_hiddenChat_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

