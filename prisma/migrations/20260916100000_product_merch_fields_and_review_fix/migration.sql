-- AlterTable
ALTER TABLE `Product`
    ADD COLUMN `soldCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `saleEndsAt` DATETIME(3) NULL,
    ADD COLUMN `limitedStockEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `limitedStockQuantity` INTEGER NULL;

-- Data fix: `rating`/`reviewCount` were seeded as hand-typed fake numbers,
-- decoupled from the real ProductReview table (0 approved reviews for any
-- seed product). Recompute both from actual approved reviews so the
-- storefront shows real counts (falling back to "No reviews yet" when 0)
-- instead of inflated fake ones.
UPDATE `Product` p
SET
    p.reviewCount = (
        SELECT COUNT(*) FROM `ProductReview` r
        WHERE r.productId = p.id AND r.status = 'approved'
    ),
    p.rating = (
        SELECT ROUND(AVG(r.rating), 1) FROM `ProductReview` r
        WHERE r.productId = p.id AND r.status = 'approved'
    );
