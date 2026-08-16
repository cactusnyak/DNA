CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATING', 'PENDING', 'WAITING_FOR_CAPTURE', 'SUCCEEDED', 'CANCELED');

CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "activeOrderId" TEXT,
    "idempotenceKey" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATING',
    "amount" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'RUB',
    "test" BOOLEAN,
    "cancellationReason" TEXT,
    "providerCreatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAttempt_activeOrderId_key" ON "PaymentAttempt"("activeOrderId");
CREATE UNIQUE INDEX "PaymentAttempt_idempotenceKey_key" ON "PaymentAttempt"("idempotenceKey");
CREATE UNIQUE INDEX "PaymentAttempt_providerPaymentId_key" ON "PaymentAttempt"("providerPaymentId");
CREATE INDEX "PaymentAttempt_orderId_createdAt_idx" ON "PaymentAttempt"("orderId", "createdAt");

ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
