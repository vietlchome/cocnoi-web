-- DropForeignKey
ALTER TABLE "SizeOption" DROP CONSTRAINT "SizeOption_categoryId_fkey";

-- DropIndex
DROP INDEX "SizeOption_name_categoryId_key";

-- AlterTable
ALTER TABLE "SizeOption" DROP COLUMN "categoryId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FinishOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinishOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FinishOptionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FinishOption_name_key" ON "FinishOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FinishOption_slug_key" ON "FinishOption"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_FinishOptionToProduct_AB_unique" ON "_FinishOptionToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_FinishOptionToProduct_B_index" ON "_FinishOptionToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "SizeOption_name_key" ON "SizeOption"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SizeOption_slug_key" ON "SizeOption"("slug");

-- AddForeignKey
ALTER TABLE "_FinishOptionToProduct" ADD CONSTRAINT "_FinishOptionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "FinishOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FinishOptionToProduct" ADD CONSTRAINT "_FinishOptionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
