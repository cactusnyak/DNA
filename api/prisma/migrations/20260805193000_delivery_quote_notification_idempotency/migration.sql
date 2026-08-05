-- Existing rows predate client-generated request IDs, so use their own IDs.
ALTER TABLE "OversizedDeliveryQuote"
ADD COLUMN "clientRequestId" TEXT,
ADD COLUMN "managerNotifiedAt" TIMESTAMP(3),
ADD COLUMN "managerEmailMessageId" TEXT;

UPDATE "OversizedDeliveryQuote"
SET "clientRequestId" = "id"
WHERE "clientRequestId" IS NULL;

ALTER TABLE "OversizedDeliveryQuote"
ALTER COLUMN "clientRequestId" SET NOT NULL;

CREATE UNIQUE INDEX "OversizedDeliveryQuote_clientRequestId_key"
ON "OversizedDeliveryQuote"("clientRequestId");
