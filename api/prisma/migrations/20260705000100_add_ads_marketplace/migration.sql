-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM (
  'DRAFT',
  'PENDING_MODERATION',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED'
);

-- CreateTable
CREATE TABLE "AdCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "description" TEXT,
  "parentId" TEXT,
  "imageId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),

  CONSTRAINT "AdCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ad" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "status" "AdStatus" NOT NULL DEFAULT 'PENDING_MODERATION',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "deletedAt" TIMESTAMP(3),
  "moderatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdImage" (
  "adId" TEXT NOT NULL,
  "imageId" TEXT NOT NULL,

  CONSTRAINT "AdImage_pkey" PRIMARY KEY ("adId", "imageId")
);

-- Soft-delete friendly unique indexes for slugs
CREATE UNIQUE INDEX "AdCategory_active_slug_key"
ON "AdCategory" ("slug")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Ad_active_slug_key"
ON "Ad" ("slug")
WHERE "deletedAt" IS NULL;

-- AddForeignKey
ALTER TABLE "AdCategory"
ADD CONSTRAINT "AdCategory_parentId_fkey"
FOREIGN KEY ("parentId")
REFERENCES "AdCategory" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdCategory"
ADD CONSTRAINT "AdCategory_imageId_fkey"
FOREIGN KEY ("imageId")
REFERENCES "Image" ("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad"
ADD CONSTRAINT "Ad_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "AdCategory" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad"
ADD CONSTRAINT "Ad_sellerId_fkey"
FOREIGN KEY ("sellerId")
REFERENCES "User" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImage"
ADD CONSTRAINT "AdImage_adId_fkey"
FOREIGN KEY ("adId")
REFERENCES "Ad" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdImage"
ADD CONSTRAINT "AdImage_imageId_fkey"
FOREIGN KEY ("imageId")
REFERENCES "Image" ("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
