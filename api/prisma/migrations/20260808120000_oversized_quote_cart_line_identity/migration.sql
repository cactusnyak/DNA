ALTER TABLE "OversizedDeliveryQuote"
ADD COLUMN "cartLineKey" TEXT;

UPDATE "OversizedDeliveryQuote"
SET "cartLineKey" = "productId" || ':legacy:' || "id";

ALTER TABLE "OversizedDeliveryQuote"
ALTER COLUMN "cartLineKey" SET NOT NULL;

CREATE INDEX "OversizedDeliveryQuote_cartLineKey_status_idx"
ON "OversizedDeliveryQuote"("cartLineKey", "status");
