/*
Warnings:

- Added the required column `customerName` to the `Order` table without a default value. This is not possible if the table is not empty.
- Added the required column `customerPhone` to the `Order` table without a default value. This is not possible if the table is not empty.
- Added the required column `deliveryAddress` to the `Order` table without a default value. This is not possible if the table is not empty.
- Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

 */
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SELLER';

-- DropForeignKey
ALTER TABLE "Order"
DROP CONSTRAINT "Order_userId_fkey";

-- Fix for Order table: Add columns with default values first
ALTER TABLE "Order"
ADD COLUMN "customerName" TEXT;

ALTER TABLE "Order"
ADD COLUMN "customerPhone" TEXT;

ALTER TABLE "Order"
ADD COLUMN "deliveryAddress" TEXT;

-- Update existing rows with temporary values (modify as needed)
UPDATE "Order"
SET
  "customerName" = 'Guest User'
WHERE
  "customerName" IS NULL;

UPDATE "Order"
SET
  "customerPhone" = '0000000000'
WHERE
  "customerPhone" IS NULL;

UPDATE "Order"
SET
  "deliveryAddress" = 'Address not provided'
WHERE
  "deliveryAddress" IS NULL;

-- Now make the columns required
ALTER TABLE "Order"
ALTER COLUMN "customerName"
SET
  NOT NULL;

ALTER TABLE "Order"
ALTER COLUMN "customerPhone"
SET
  NOT NULL;

ALTER TABLE "Order"
ALTER COLUMN "deliveryAddress"
SET
  NOT NULL;

-- Add other Order columns
ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "comment" TEXT;

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "customerEmail" TEXT;

ALTER TABLE "Order"
ADD COLUMN IF NOT EXISTS "guestSessionId" TEXT;

ALTER TABLE "Order"
ALTER COLUMN "userId"
DROP NOT NULL;

-- Fix for Product table: Add createdAt and updatedAt
ALTER TABLE "Product"
ADD COLUMN "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Product"
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- Update existing rows with current timestamp
UPDATE "Product"
SET
  "createdAt" = CURRENT_TIMESTAMP
WHERE
  "createdAt" IS NULL;

UPDATE "Product"
SET
  "updatedAt" = CURRENT_TIMESTAMP
WHERE
  "updatedAt" IS NULL;

-- Now make the columns required
ALTER TABLE "Product"
ALTER COLUMN "createdAt"
SET
  NOT NULL;

ALTER TABLE "Product"
ALTER COLUMN "updatedAt"
SET
  NOT NULL;

ALTER TABLE "Product"
ALTER COLUMN "createdAt"
DROP DEFAULT;

-- Optional: remove default if you want
-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;