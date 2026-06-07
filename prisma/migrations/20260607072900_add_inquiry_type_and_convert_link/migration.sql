-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('RETAIL_B2C', 'WHOLESALE_B2B', 'CORPORATE_B2B', 'CONTACT_GENERAL');

-- AlterEnum
ALTER TYPE "Visibility" ADD VALUE 'HIDDEN';

-- DropForeignKey
ALTER TABLE "OrderInquiry" DROP CONSTRAINT "OrderInquiry_orderId_fkey";

-- DropIndex
DROP INDEX "OrderInquiry_orderId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "sourceInquiryId" TEXT;

-- AlterTable
ALTER TABLE "OrderInquiry" DROP COLUMN "orderId",
ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "convertedOrderId" TEXT,
ADD COLUMN     "inquiryType" "InquiryType" NOT NULL DEFAULT 'RETAIL_B2C';

-- CreateIndex
CREATE UNIQUE INDEX "Order_sourceInquiryId_key" ON "Order"("sourceInquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderInquiry_convertedOrderId_key" ON "OrderInquiry"("convertedOrderId");

-- CreateIndex
CREATE INDEX "OrderInquiry_status_inquiryType_createdAt_idx" ON "OrderInquiry"("status", "inquiryType", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sourceInquiryId_fkey" FOREIGN KEY ("sourceInquiryId") REFERENCES "OrderInquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderInquiry" ADD CONSTRAINT "OrderInquiry_convertedOrderId_fkey" FOREIGN KEY ("convertedOrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
