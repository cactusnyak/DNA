ALTER TABLE "OtpCode"
  ALTER COLUMN "code" DROP NOT NULL,
  ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'login',
  ADD COLUMN "codeHash" TEXT,
  ADD COLUMN "verifyAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "consumedAt" TIMESTAMP(3),
  ADD COLUMN "provider" TEXT,
  ADD COLUMN "providerMessageId" TEXT,
  ADD COLUMN "providerStatusCode" INTEGER,
  ADD COLUMN "deliveryStatus" TEXT,
  ADD COLUMN "providerErrorCode" TEXT,
  ADD COLUMN "sentAt" TIMESTAMP(3),
  ADD COLUMN "deliveredAt" TIMESTAMP(3),
  ADD COLUMN "failedAt" TIMESTAMP(3),
  ADD COLUMN "clientIpHash" TEXT;

DROP INDEX IF EXISTS "OtpCode_code_idx";
DROP INDEX IF EXISTS "OtpCode_login_code_idx";

CREATE UNIQUE INDEX "OtpCode_providerMessageId_key"
  ON "OtpCode"("providerMessageId");
CREATE INDEX "OtpCode_login_createdAt_idx"
  ON "OtpCode"("login", "createdAt");
CREATE INDEX "OtpCode_clientIpHash_createdAt_idx"
  ON "OtpCode"("clientIpHash", "createdAt");
