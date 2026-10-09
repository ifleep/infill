-- CreateTable
CREATE TABLE `ReviewPhoto` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `position` INTEGER NOT NULL DEFAULT 0,

    INDEX `ReviewPhoto_reviewId_idx`(`reviewId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReviewPhoto` ADD CONSTRAINT `ReviewPhoto_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `ProductReview`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
