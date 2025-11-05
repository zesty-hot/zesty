/*
  Warnings:

  - A unique constraint covering the columns `[workerId]` on the table `PrivateAd` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Images" ADD COLUMN     "NSFW" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PrivateAdService" ALTER COLUMN "length" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PrivateOffer" ADD COLUMN     "chatId" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "offerId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "suburb" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "PrivateAd_workerId_key" ON "PrivateAd"("workerId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "PrivateOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateOffer" ADD CONSTRAINT "PrivateOffer_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
