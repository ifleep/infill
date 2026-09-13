-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "machineCategory" TEXT,
    "technology" TEXT,
    "experienceLevel" TEXT NOT NULL DEFAULT '[]',
    "useCases" TEXT NOT NULL DEFAULT '[]',
    "price" INTEGER NOT NULL,
    "compareAtPrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "availability" TEXT NOT NULL DEFAULT 'in-stock',
    "quoteOnly" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT NOT NULL DEFAULT '[]',
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specifications" TEXT NOT NULL DEFAULT '[]',
    "materials" TEXT,
    "buildVolumeX" REAL,
    "buildVolumeY" REAL,
    "buildVolumeZ" REAL,
    "speedMmPerSec" REAL,
    "weightKg" REAL,
    "dimWidth" REAL,
    "dimDepth" REAL,
    "dimHeight" REAL,
    "warrantyMonths" INTEGER NOT NULL DEFAULT 0,
    "accessoryIds" TEXT,
    "relatedProductIds" TEXT,
    "compatibleFilamentTags" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "rating" REAL,
    "reviewCount" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
