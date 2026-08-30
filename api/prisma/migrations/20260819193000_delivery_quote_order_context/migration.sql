ALTER TABLE "DeliveryProvider"
ADD COLUMN "fixedMarkup" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "DeliveryQuote"
ADD COLUMN "orderId" TEXT,
ADD COLUMN "groupKey" TEXT;

CREATE INDEX "DeliveryQuote_orderId_groupKey_expiresAt_idx"
ON "DeliveryQuote"("orderId", "groupKey", "expiresAt");

ALTER TABLE "DeliveryQuote"
ADD CONSTRAINT "DeliveryQuote_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
