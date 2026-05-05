-- CreateTable
CREATE TABLE "_escortFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_escortFollowers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_escortFollowers_B_index" ON "_escortFollowers"("B");

-- AddForeignKey
ALTER TABLE "_escortFollowers" ADD CONSTRAINT "_escortFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "private_ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_escortFollowers" ADD CONSTRAINT "_escortFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "zesty_user"("zesty_id") ON DELETE CASCADE ON UPDATE CASCADE;
