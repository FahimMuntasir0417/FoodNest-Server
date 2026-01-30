/*
  Warnings:

  - Added the required column `customerId` to the `order_item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_item" ADD COLUMN     "customerId" TEXT NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "order_item_customerId_idx" ON "order_item"("customerId");

-- AddForeignKey
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
