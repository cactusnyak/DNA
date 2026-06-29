-- CreateEnum
CREATE TYPE "CatalogCollectionType" AS ENUM ('CATEGORY', 'PRODUCT');

-- AlterTable
ALTER TABLE "Category"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- Soft-delete friendly unique indexes for slugs
DROP INDEX IF EXISTS "Category_slug_key";
DROP INDEX IF EXISTS "Product_slug_key";

CREATE UNIQUE INDEX "Category_active_slug_key"
ON "Category" ("slug")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Product_active_slug_key"
ON "Product" ("slug")
WHERE "deletedAt" IS NULL;

-- CreateTable
CREATE TABLE "CatalogCollection" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" "CatalogCollectionType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CatalogCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogCollectionCategory" (
  "collectionId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "CatalogCollectionCategory_pkey" PRIMARY KEY ("collectionId", "categoryId")
);

-- CreateTable
CREATE TABLE "CatalogCollectionProduct" (
  "collectionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "CatalogCollectionProduct_pkey" PRIMARY KEY ("collectionId", "productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogCollection_slug_key"
ON "CatalogCollection" ("slug");

-- AddForeignKey
ALTER TABLE "CatalogCollectionCategory"
ADD CONSTRAINT "CatalogCollectionCategory_collectionId_fkey"
FOREIGN KEY ("collectionId")
REFERENCES "CatalogCollection" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogCollectionCategory"
ADD CONSTRAINT "CatalogCollectionCategory_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "Category" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogCollectionProduct"
ADD CONSTRAINT "CatalogCollectionProduct_collectionId_fkey"
FOREIGN KEY ("collectionId")
REFERENCES "CatalogCollection" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogCollectionProduct"
ADD CONSTRAINT "CatalogCollectionProduct_productId_fkey"
FOREIGN KEY ("productId")
REFERENCES "Product" ("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
