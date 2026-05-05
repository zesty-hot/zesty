-- AlterTable
ALTER TABLE "dating_pages" ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedById" TEXT;

-- AddForeignKey
ALTER TABLE "dating_pages" ADD CONSTRAINT "dating_pages_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "zesty_user"("zesty_id") ON DELETE SET NULL ON UPDATE CASCADE;
