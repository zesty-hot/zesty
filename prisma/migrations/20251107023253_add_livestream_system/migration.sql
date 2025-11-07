-- CreateTable
CREATE TABLE "LiveStreamPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(3000),
    "active" BOOLEAN NOT NULL DEFAULT false,
    "roomName" TEXT,
    "ingressId" TEXT,
    "streamKey" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveStreamPage_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreamPage_slug_key" ON "LiveStreamPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreamPage_roomName_key" ON "LiveStreamPage"("roomName");

-- CreateIndex
CREATE INDEX "LiveStreamPage_active_createdAt_idx" ON "LiveStreamPage"("active", "createdAt");

-- CreateIndex
CREATE INDEX "LiveStreamPage_slug_idx" ON "LiveStreamPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LiveStreamPage_userId_key" ON "LiveStreamPage"("userId");

-- CreateIndex
CREATE INDEX "LiveStreamDonation_streamId_createdAt_idx" ON "LiveStreamDonation"("streamId", "createdAt");

-- AddForeignKey
ALTER TABLE "LiveStreamPage" ADD CONSTRAINT "LiveStreamPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamDonation" ADD CONSTRAINT "LiveStreamDonation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveStreamDonation" ADD CONSTRAINT "LiveStreamDonation_streamId_fkey" FOREIGN KEY ("streamId") REFERENCES "LiveStreamPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
