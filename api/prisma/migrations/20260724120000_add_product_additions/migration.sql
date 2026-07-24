ALTER TABLE "Product" ADD COLUMN "additions" JSONB;

ALTER TABLE "OrderItem"
ADD COLUMN "baseUnitPrice" INTEGER,
ADD COLUMN "selectedAdditions" JSONB;

UPDATE "OrderItem"
SET "baseUnitPrice" = "unitPrice",
    "selectedAdditions" = '[]'::jsonb;

ALTER TABLE "OrderItem"
ALTER COLUMN "baseUnitPrice" SET NOT NULL;
