/*
  Warnings:

  - Made the column `durationMin` on table `PrivateOffer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `service` on table `PrivateOffer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PrivateAdServiceCategory" ADD VALUE IF NOT EXISTS 'VIDEO_CHAT';
ALTER TYPE "PrivateOfferStatus" ADD VALUE IF NOT EXISTS 'OFFER';

-- AlterTable
ALTER TABLE "PrivateOffer" ALTER COLUMN "status" SET DEFAULT 'OFFER',
ALTER COLUMN "durationMin" SET NOT NULL,
ALTER COLUMN "service" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;
