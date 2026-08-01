CREATE TYPE "OversizedDeliveryQuoteStatus" AS ENUM ('PENDING', 'QUOTED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

ALTER TABLE "Category" ADD COLUMN "isOversized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "isOversizedOverride" BOOLEAN;
ALTER TABLE "OrderItem" ADD COLUMN "isOversized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deliveryQuoteId" TEXT,
ADD COLUMN "deliveryPrice" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deliverySnapshot" JSONB;

CREATE TABLE "OversizedDeliveryQuote" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "userId" TEXT,
  "guestSessionId" TEXT,
  "quantity" INTEGER NOT NULL,
  "dispatchLocation" JSONB NOT NULL,
  "destinationRegion" TEXT NOT NULL,
  "destinationCity" TEXT NOT NULL,
  "destinationAddress" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerPhone" TEXT NOT NULL,
  "customerEmail" TEXT,
  "customerComment" TEXT,
  "unloadingRequired" BOOLEAN NOT NULL DEFAULT false,
  "accessRestrictions" TEXT,
  "status" "OversizedDeliveryQuoteStatus" NOT NULL DEFAULT 'PENDING',
  "confirmedDeliveryPrice" INTEGER,
  "currency" "Currency" NOT NULL DEFAULT 'RUB',
  "managerComment" TEXT,
  "expiresAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OversizedDeliveryQuote_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "OrderItem_deliveryQuoteId_key" ON "OrderItem"("deliveryQuoteId");
CREATE INDEX "OversizedDeliveryQuote_productId_status_idx" ON "OversizedDeliveryQuote"("productId", "status");
CREATE INDEX "OversizedDeliveryQuote_userId_createdAt_idx" ON "OversizedDeliveryQuote"("userId", "createdAt");
CREATE INDEX "OversizedDeliveryQuote_guestSessionId_createdAt_idx" ON "OversizedDeliveryQuote"("guestSessionId", "createdAt");
ALTER TABLE "OversizedDeliveryQuote" ADD CONSTRAINT "OversizedDeliveryQuote_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OversizedDeliveryQuote" ADD CONSTRAINT "OversizedDeliveryQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_deliveryQuoteId_fkey" FOREIGN KEY ("deliveryQuoteId") REFERENCES "OversizedDeliveryQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
