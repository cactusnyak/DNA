ALTER TABLE "Order"
ADD COLUMN "deliveryDestination" JSONB,
ADD COLUMN "deliveryVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "pricingVersion" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "DeliveryQuote"
ADD COLUMN "quoteKey" TEXT,
ADD COLUMN "destinationVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "orderDeliveryVersion" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX "DeliveryQuote_quoteKey_key" ON "DeliveryQuote"("quoteKey");

CREATE TABLE "OrderDeliverySelection" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "groupKey" TEXT NOT NULL,
  "deliveryQuoteId" TEXT NOT NULL,
  "customerCharge" INTEGER NOT NULL,
  "currency" "Currency" NOT NULL DEFAULT 'RUB',
  "quoteFingerprint" TEXT NOT NULL,
  "destinationVersion" INTEGER NOT NULL,
  "orderDeliveryVersion" INTEGER NOT NULL,
  "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OrderDeliverySelection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderDeliverySelection_deliveryQuoteId_key"
ON "OrderDeliverySelection"("deliveryQuoteId");

CREATE UNIQUE INDEX "OrderDeliverySelection_orderId_groupKey_key"
ON "OrderDeliverySelection"("orderId", "groupKey");

CREATE INDEX "OrderDeliverySelection_orderId_selectedAt_idx"
ON "OrderDeliverySelection"("orderId", "selectedAt");

ALTER TABLE "OrderDeliverySelection"
ADD CONSTRAINT "OrderDeliverySelection_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderDeliverySelection"
ADD CONSTRAINT "OrderDeliverySelection_deliveryQuoteId_fkey"
FOREIGN KEY ("deliveryQuoteId") REFERENCES "DeliveryQuote"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
