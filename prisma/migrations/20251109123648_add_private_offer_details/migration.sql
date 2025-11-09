-- AlterEnum
ALTER TYPE "PrivateOfferStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "PrivateOfferStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

-- AlterTable
ALTER TABLE "PrivateOffer" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "creditFeePaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dayRequested" "DaysAvailable",
ADD COLUMN     "disputeRaisedAt" TIMESTAMP(3),
ADD COLUMN     "disputeReason" VARCHAR(1000),
ADD COLUMN     "disputeResolvedAt" TIMESTAMP(3),
ADD COLUMN     "durationMin" INTEGER,
ADD COLUMN     "extras" TEXT[],
ADD COLUMN     "isAsap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformFeePaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releasedAt" TIMESTAMP(3),
ADD COLUMN     "scheduledFor" TIMESTAMP(3),
ADD COLUMN     "service" "PrivateAdServiceCategory",
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "stripeTransferId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- Update existing records to set updatedAt
UPDATE "PrivateOffer" SET "updatedAt" = NOW() WHERE "updatedAt" IS NULL;

-- Make updatedAt required after populating existing records
ALTER TABLE "PrivateOffer" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "PrivateOffer_clientId_status_idx" ON "PrivateOffer"("clientId", "status");

-- CreateIndex
CREATE INDEX "PrivateOffer_workerId_status_idx" ON "PrivateOffer"("workerId", "status");

-- CreateIndex
CREATE INDEX "PrivateOffer_status_completedAt_idx" ON "PrivateOffer"("status", "completedAt");
