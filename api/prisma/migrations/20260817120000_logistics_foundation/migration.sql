-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('OWN', 'SELLER', 'FULFILLMENT');

-- CreateEnum
CREATE TYPE "PackageType" AS ENUM ('BOX', 'PALLET', 'ENVELOPE', 'CRATE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeliveryServiceKind" AS ENUM ('DOOR', 'PICKUP', 'EXPRESS', 'CARGO', 'MANUAL');

-- CreateEnum
CREATE TYPE "DeliveryQuoteStatus" AS ENUM ('CREATED', 'SELECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('DRAFT', 'WAITING_FOR_ITEMS', 'READY', 'QUOTING', 'BOOKING', 'BOOKED', 'COURIER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'BOOKING_FAILED', 'DELIVERY_FAILED', 'CANCELLED', 'RETURNING', 'RETURNED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "ShipmentItemFulfillmentStatus" AS ENUM ('PENDING', 'PICKING', 'PACKED', 'READY', 'HANDED_OVER', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ShipmentStatusSource" AS ENUM ('SYSTEM', 'ADMIN', 'PROVIDER', 'RECONCILIATION');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "purchasePrice" INTEGER,
ADD COLUMN     "sku" TEXT;

-- CreateTable
CREATE TABLE "ProductShippingProfile" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "isFragile" BOOLEAN NOT NULL DEFAULT false,
    "isStackable" BOOLEAN NOT NULL DEFAULT true,
    "ageRestricted" BOOLEAN NOT NULL DEFAULT false,
    "handlingNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductShippingProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPackageProfile" (
    "id" TEXT NOT NULL,
    "shippingProfileId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" TEXT,
    "type" "PackageType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weightGrams" INTEGER NOT NULL,
    "lengthMillimeters" INTEGER NOT NULL,
    "widthMillimeters" INTEGER NOT NULL,
    "heightMillimeters" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPackageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL DEFAULT 'OWN',
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "street" TEXT,
    "building" TEXT,
    "postalCode" TEXT,
    "fullAddress" TEXT,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "contactName" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "timezone" TEXT,
    "workingHours" JSONB,
    "courierInstructions" TEXT,
    "loadingAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductWarehouse" (
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductWarehouse_pkey" PRIMARY KEY ("productId","warehouseId")
);

-- CreateTable
CREATE TABLE "DeliveryProvider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryService" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "DeliveryServiceKind" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductDeliveryService" (
    "productId" TEXT NOT NULL,
    "deliveryServiceId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDeliveryService_pkey" PRIMARY KEY ("productId","deliveryServiceId")
);

-- CreateTable
CREATE TABLE "WarehouseProviderConfig" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "deliveryProviderId" TEXT NOT NULL,
    "externalLocationId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WarehouseProviderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryQuote" (
    "id" TEXT NOT NULL,
    "deliveryProviderId" TEXT NOT NULL,
    "deliveryServiceId" TEXT NOT NULL,
    "userId" TEXT,
    "guestSessionId" TEXT,
    "status" "DeliveryQuoteStatus" NOT NULL DEFAULT 'CREATED',
    "originWarehouseId" TEXT NOT NULL,
    "originSnapshot" JSONB NOT NULL,
    "destinationSnapshot" JSONB NOT NULL,
    "cargoSnapshot" JSONB NOT NULL,
    "providerCost" INTEGER NOT NULL,
    "customerCharge" INTEGER NOT NULL,
    "subsidyAmount" INTEGER NOT NULL DEFAULT 0,
    "markupAmount" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "providerQuoteId" TEXT,
    "providerPayload" JSONB,
    "fingerprint" TEXT NOT NULL,
    "selectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "deliveryProviderId" TEXT NOT NULL,
    "deliveryServiceId" TEXT NOT NULL,
    "deliveryQuoteId" TEXT,
    "originWarehouseId" TEXT NOT NULL,
    "originSnapshot" JSONB NOT NULL,
    "destinationSnapshot" JSONB NOT NULL,
    "cargoSnapshot" JSONB NOT NULL,
    "serviceSnapshot" JSONB NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'DRAFT',
    "providerOrderId" TEXT,
    "trackingId" TEXT,
    "trackingUrl" TEXT,
    "providerCost" INTEGER NOT NULL,
    "customerCharge" INTEGER NOT NULL,
    "subsidyAmount" INTEGER NOT NULL DEFAULT 0,
    "markupAmount" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "idempotencyKey" TEXT NOT NULL,
    "providerMetadata" JSONB,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "lastErrorMessage" TEXT,
    "lastAttemptedAt" TIMESTAMP(3),
    "bookedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentItem" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fulfillmentStatus" "ShipmentItemFulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipmentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentStatusEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "previousStatus" "ShipmentStatus",
    "status" "ShipmentStatus" NOT NULL,
    "source" "ShipmentStatusSource" NOT NULL,
    "actorUserId" TEXT,
    "providerStatus" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipmentStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductShippingProfile_productId_key" ON "ProductShippingProfile"("productId");

-- CreateIndex
CREATE INDEX "ProductPackageProfile_shippingProfileId_idx" ON "ProductPackageProfile"("shippingProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPackageProfile_shippingProfileId_sequence_key" ON "ProductPackageProfile"("shippingProfileId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "ProductWarehouse_warehouseId_idx" ON "ProductWarehouse"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryProvider_code_key" ON "DeliveryProvider"("code");

-- CreateIndex
CREATE INDEX "DeliveryService_providerId_isActive_idx" ON "DeliveryService"("providerId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryService_providerId_code_key" ON "DeliveryService"("providerId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryService_providerId_id_key" ON "DeliveryService"("providerId", "id");

-- CreateIndex
CREATE INDEX "ProductDeliveryService_deliveryServiceId_idx" ON "ProductDeliveryService"("deliveryServiceId");

-- CreateIndex
CREATE INDEX "WarehouseProviderConfig_deliveryProviderId_idx" ON "WarehouseProviderConfig"("deliveryProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "WarehouseProviderConfig_warehouseId_deliveryProviderId_key" ON "WarehouseProviderConfig"("warehouseId", "deliveryProviderId");

-- CreateIndex
CREATE INDEX "DeliveryQuote_userId_status_expiresAt_idx" ON "DeliveryQuote"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "DeliveryQuote_guestSessionId_status_expiresAt_idx" ON "DeliveryQuote"("guestSessionId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "DeliveryQuote_deliveryProviderId_providerQuoteId_idx" ON "DeliveryQuote"("deliveryProviderId", "providerQuoteId");

-- CreateIndex
CREATE INDEX "DeliveryQuote_fingerprint_idx" ON "DeliveryQuote"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_deliveryQuoteId_key" ON "Shipment"("deliveryQuoteId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_idempotencyKey_key" ON "Shipment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_deliveryProviderId_providerOrderId_idx" ON "Shipment"("deliveryProviderId", "providerOrderId");

-- CreateIndex
CREATE INDEX "Shipment_trackingId_idx" ON "Shipment"("trackingId");

-- CreateIndex
CREATE INDEX "Shipment_status_attemptCount_lastAttemptedAt_idx" ON "Shipment"("status", "attemptCount", "lastAttemptedAt");

-- CreateIndex
CREATE INDEX "ShipmentItem_orderItemId_idx" ON "ShipmentItem"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentItem_shipmentId_orderItemId_key" ON "ShipmentItem"("shipmentId", "orderItemId");

-- CreateIndex
CREATE INDEX "ShipmentStatusEvent_shipmentId_createdAt_idx" ON "ShipmentStatusEvent"("shipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "ShipmentStatusEvent_source_createdAt_idx" ON "ShipmentStatusEvent"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- AddForeignKey
ALTER TABLE "ProductShippingProfile" ADD CONSTRAINT "ProductShippingProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPackageProfile" ADD CONSTRAINT "ProductPackageProfile_shippingProfileId_fkey" FOREIGN KEY ("shippingProfileId") REFERENCES "ProductShippingProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductWarehouse" ADD CONSTRAINT "ProductWarehouse_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryService" ADD CONSTRAINT "DeliveryService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "DeliveryProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDeliveryService" ADD CONSTRAINT "ProductDeliveryService_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductDeliveryService" ADD CONSTRAINT "ProductDeliveryService_deliveryServiceId_fkey" FOREIGN KEY ("deliveryServiceId") REFERENCES "DeliveryService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProviderConfig" ADD CONSTRAINT "WarehouseProviderConfig_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarehouseProviderConfig" ADD CONSTRAINT "WarehouseProviderConfig_deliveryProviderId_fkey" FOREIGN KEY ("deliveryProviderId") REFERENCES "DeliveryProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_deliveryProviderId_fkey" FOREIGN KEY ("deliveryProviderId") REFERENCES "DeliveryProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_deliveryProviderId_deliveryServiceId_fkey" FOREIGN KEY ("deliveryProviderId", "deliveryServiceId") REFERENCES "DeliveryService"("providerId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_originWarehouseId_fkey" FOREIGN KEY ("originWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_deliveryProviderId_fkey" FOREIGN KEY ("deliveryProviderId") REFERENCES "DeliveryProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_deliveryProviderId_deliveryServiceId_fkey" FOREIGN KEY ("deliveryProviderId", "deliveryServiceId") REFERENCES "DeliveryService"("providerId", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_deliveryQuoteId_fkey" FOREIGN KEY ("deliveryQuoteId") REFERENCES "DeliveryQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_originWarehouseId_fkey" FOREIGN KEY ("originWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentStatusEvent" ADD CONSTRAINT "ShipmentStatusEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentStatusEvent" ADD CONSTRAINT "ShipmentStatusEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain invariants Prisma cannot express.
ALTER TABLE "Product" ADD CONSTRAINT "Product_purchasePrice_nonnegative" CHECK ("purchasePrice" IS NULL OR "purchasePrice" >= 0);
ALTER TABLE "ProductPackageProfile" ADD CONSTRAINT "ProductPackageProfile_positive_values" CHECK ("sequence" >= 0 AND "quantity" > 0 AND "weightGrams" > 0 AND "lengthMillimeters" > 0 AND "widthMillimeters" > 0 AND "heightMillimeters" > 0);
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_single_owner" CHECK (("userId" IS NOT NULL AND "guestSessionId" IS NULL) OR ("userId" IS NULL AND "guestSessionId" IS NOT NULL));
ALTER TABLE "DeliveryQuote" ADD CONSTRAINT "DeliveryQuote_nonnegative_money" CHECK ("providerCost" >= 0 AND "customerCharge" >= 0 AND "subsidyAmount" >= 0 AND "markupAmount" >= 0);
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_nonnegative_money_and_attempts" CHECK ("providerCost" >= 0 AND "customerCharge" >= 0 AND "subsidyAmount" >= 0 AND "markupAmount" >= 0 AND "attemptCount" >= 0);
ALTER TABLE "ShipmentItem" ADD CONSTRAINT "ShipmentItem_quantity_positive" CHECK ("quantity" > 0);
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_coordinates_valid" CHECK (("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90) AND ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180));
CREATE UNIQUE INDEX "ProductWarehouse_one_primary_per_product" ON "ProductWarehouse"("productId") WHERE "isPrimary" = true;
