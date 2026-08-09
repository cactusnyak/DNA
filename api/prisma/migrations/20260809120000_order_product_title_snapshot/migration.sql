ALTER TABLE "OrderItem" ADD COLUMN "productTitle" TEXT;

UPDATE "OrderItem" AS item
SET "productTitle" = product."title"
FROM "Product" AS product
WHERE item."productId" = product."id"
  AND item."productTitle" IS NULL;
