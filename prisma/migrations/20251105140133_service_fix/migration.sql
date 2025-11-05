/*
  Warnings:

  - The values [PUBLIC_LOCATION,OVERNIGHT] on the enum `PrivateAdServiceCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `days` on the `PrivateAdService` table. All the data in the column will be lost.
  - You are about to drop the column `isExtra` on the `PrivateAdService` table. All the data in the column will be lost.
  - You are about to drop the column `length` on the `PrivateAdService` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PrivateAdService` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PrivateAdService` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PrivateAdExtraType" AS ENUM ('FILMING', 'BJ', 'ANAL', 'BDSM', 'NATURAL', 'EXTRA_PERSON', 'OUTSIDE_LOCATION', 'COSTUME', 'ROLEPLAY', 'TOY_USE', 'CREAMPIE', 'GOLDEN_SHOWER');

-- AlterEnum
BEGIN;
CREATE TYPE "PrivateAdServiceCategory_new" AS ENUM ('MASSAGE', 'IN_CALL', 'OUT_CALL', 'MEET_AND_GREET');
ALTER TABLE "public"."PrivateAdService" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "PrivateAdService" ALTER COLUMN "category" TYPE "PrivateAdServiceCategory_new" USING ("category"::text::"PrivateAdServiceCategory_new");
ALTER TYPE "PrivateAdServiceCategory" RENAME TO "PrivateAdServiceCategory_old";
ALTER TYPE "PrivateAdServiceCategory_new" RENAME TO "PrivateAdServiceCategory";
DROP TYPE "public"."PrivateAdServiceCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "PrivateAd" ADD COLUMN     "acceptsAgeRange" INTEGER[],
ADD COLUMN     "acceptsBodyType" "BodyType"[];

-- AlterTable
ALTER TABLE "PrivateAdService" DROP COLUMN "days",
DROP COLUMN "isExtra",
DROP COLUMN "length",
DROP COLUMN "price",
DROP COLUMN "type",
ADD COLUMN     "label" TEXT,
ALTER COLUMN "category" DROP DEFAULT;

-- DropEnum
DROP TYPE "public"."PrivateAdServiceType";

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

-- AddForeignKey
ALTER TABLE "ServiceOption" ADD CONSTRAINT "ServiceOption_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "PrivateAdService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrivateAdExtra" ADD CONSTRAINT "PrivateAdExtra_privateAdId_fkey" FOREIGN KEY ("privateAdId") REFERENCES "PrivateAd"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
