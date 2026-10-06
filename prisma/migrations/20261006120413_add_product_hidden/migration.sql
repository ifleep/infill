-- AlterTable
ALTER TABLE `Product` ADD COLUMN `hidden` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `Product_hidden_idx` ON `Product`(`hidden`);
