/*
  Warnings:

  - You are about to drop the column `title` on the `DatingPage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `LiveStreamPage` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `VIPPage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DatingPage" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "LiveStreamPage" DROP COLUMN "title";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "title" VARCHAR(200);

-- AlterTable
ALTER TABLE "VIPPage" DROP COLUMN "title";
