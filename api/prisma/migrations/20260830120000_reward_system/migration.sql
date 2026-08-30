CREATE TYPE "RewardType" AS ENUM ('BUYER_CASHBACK', 'REFERRAL');
CREATE TYPE "RewardStatus" AS ENUM ('PENDING', 'AVAILABLE', 'CANCELLED', 'PARTIALLY_REVERSED', 'REVERSED');
CREATE TYPE "BalanceOperationType" AS ENUM ('REWARD_PENDING', 'REWARD_RELEASE', 'REWARD_CANCEL', 'REWARD_REVERSE', 'REWARD_DEBT_REPAYMENT', 'BONUS_HOLD', 'BONUS_HOLD_RELEASE', 'BONUS_SPEND', 'ADMIN_ADJUSTMENT');
CREATE TYPE "BonusSpendingHoldStatus" AS ENUM ('ACTIVE', 'SETTLED', 'RELEASED', 'EXPIRED');

ALTER TABLE "Balance"
ADD COLUMN "pendingRewardValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "spendingHoldValue" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "debtValue" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Product" ADD COLUMN "rewardEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Order"
ADD COLUMN "bonusDiscount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "externalPaymentAmount" INTEGER NOT NULL DEFAULT 0;
UPDATE "Order" SET "externalPaymentAmount" = "totalAmount";

ALTER TABLE "OrderItem"
ADD COLUMN "bonusAllocation" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "rewardCostSnapshot" INTEGER,
ADD COLUMN "rewardPolicySnapshot" JSONB;

ALTER TABLE "ReferralReward"
ALTER COLUMN "referralId" DROP NOT NULL,
ADD COLUMN "orderItemId" TEXT,
ADD COLUMN "recipientUserId" TEXT,
ADD COLUMN "type" "RewardType",
ADD COLUMN "levelDepth" INTEGER,
ADD COLUMN "reversedAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" "RewardStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "policyVersion" INTEGER,
ADD COLUMN "calculationSnapshot" JSONB,
ADD COLUMN "availableAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "reversedAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ReferralReward" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "RewardProgramLevel" (
  "id" TEXT NOT NULL,
  "depth" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "configVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RewardProgramLevel_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RewardProgramLevel_depth_key" ON "RewardProgramLevel"("depth");

INSERT INTO "RewardProgramLevel" ("id", "depth", "name", "isActive", "configVersion", "updatedAt") VALUES
('reward-level-1', 1, 'Партнёр 1-го уровня', true, 1, CURRENT_TIMESTAMP),
('reward-level-2', 2, 'Партнёр 2-го уровня', true, 1, CURRENT_TIMESTAMP),
('reward-level-3', 3, 'Партнёр 3-го уровня', true, 1, CURRENT_TIMESTAMP),
('reward-level-4', 4, 'Партнёр 4-го уровня', true, 1, CURRENT_TIMESTAMP)
ON CONFLICT ("depth") DO NOTHING;

CREATE TABLE "ProductRewardShare" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "levelId" TEXT,
  "depth" INTEGER NOT NULL,
  "shareBasisPoints" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductRewardShare_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductRewardShare_productId_depth_key" ON "ProductRewardShare"("productId", "depth");
CREATE INDEX "ProductRewardShare_levelId_idx" ON "ProductRewardShare"("levelId");

INSERT INTO "ProductRewardShare" ("id", "productId", "levelId", "depth", "shareBasisPoints", "updatedAt")
SELECT 'reward-share-' || product."id" || '-0', product."id", NULL, 0, 1000, CURRENT_TIMESTAMP FROM "Product" product;
INSERT INTO "ProductRewardShare" ("id", "productId", "levelId", "depth", "shareBasisPoints", "updatedAt")
SELECT 'reward-share-' || product."id" || '-1', product."id", 'reward-level-1', 1, 6000, CURRENT_TIMESTAMP FROM "Product" product;
INSERT INTO "ProductRewardShare" ("id", "productId", "levelId", "depth", "shareBasisPoints", "updatedAt")
SELECT 'reward-share-' || product."id" || '-2', product."id", 'reward-level-2', 2, 3000, CURRENT_TIMESTAMP FROM "Product" product;
INSERT INTO "ProductRewardShare" ("id", "productId", "levelId", "depth", "shareBasisPoints", "updatedAt")
SELECT 'reward-share-' || product."id" || '-' || level."depth", product."id", level."id", level."depth", 0, CURRENT_TIMESTAMP
FROM "Product" product CROSS JOIN "RewardProgramLevel" level WHERE level."depth" >= 3;

CREATE TABLE "BalanceOperation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT,
  "rewardId" TEXT,
  "holdId" TEXT,
  "type" "BalanceOperationType" NOT NULL,
  "amount" INTEGER NOT NULL,
  "activeDelta" INTEGER NOT NULL DEFAULT 0,
  "pendingDelta" INTEGER NOT NULL DEFAULT 0,
  "holdDelta" INTEGER NOT NULL DEFAULT 0,
  "debtDelta" INTEGER NOT NULL DEFAULT 0,
  "currency" "Currency" NOT NULL DEFAULT 'RUB',
  "idempotencyKey" TEXT NOT NULL,
  "reason" TEXT,
  "actorUserId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BalanceOperation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BalanceOperation_idempotencyKey_key" ON "BalanceOperation"("idempotencyKey");
CREATE INDEX "BalanceOperation_userId_createdAt_id_idx" ON "BalanceOperation"("userId", "createdAt", "id");
CREATE INDEX "BalanceOperation_orderId_idx" ON "BalanceOperation"("orderId");
CREATE INDEX "BalanceOperation_rewardId_idx" ON "BalanceOperation"("rewardId");

CREATE TABLE "BonusSpendingHold" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "status" "BonusSpendingHoldStatus" NOT NULL DEFAULT 'ACTIVE',
  "pricingVersion" INTEGER NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "settledAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BonusSpendingHold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "BonusSpendingHold_orderId_key" ON "BonusSpendingHold"("orderId");
CREATE INDEX "BonusSpendingHold_userId_status_expiresAt_idx" ON "BonusSpendingHold"("userId", "status", "expiresAt");

WITH duplicate_codes AS (
  SELECT "id", "referralCode", ROW_NUMBER() OVER (PARTITION BY "referralCode" ORDER BY "createdAt", "id") AS position
  FROM "User" WHERE "referralCode" IS NOT NULL
)
UPDATE "User" AS target
SET "referralCode" = duplicate_codes."referralCode" || '-' || UPPER(SUBSTRING(target."id", 1, 8))
FROM duplicate_codes
WHERE target."id" = duplicate_codes."id" AND duplicate_codes.position > 1;
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode") WHERE "referralCode" IS NOT NULL;
CREATE UNIQUE INDEX "ReferralReward_orderItemId_recipientUserId_type_levelDepth_key" ON "ReferralReward"("orderItemId", "recipientUserId", "type", "levelDepth") WHERE "orderItemId" IS NOT NULL;
CREATE INDEX "ReferralReward_recipientUserId_status_createdAt_idx" ON "ReferralReward"("recipientUserId", "status", "createdAt");
CREATE INDEX "ReferralReward_orderId_status_idx" ON "ReferralReward"("orderId", "status");

ALTER TABLE "ProductRewardShare" ADD CONSTRAINT "ProductRewardShare_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRewardShare" ADD CONSTRAINT "ProductRewardShare_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "RewardProgramLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BalanceOperation" ADD CONSTRAINT "BalanceOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BalanceOperation" ADD CONSTRAINT "BalanceOperation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusSpendingHold" ADD CONSTRAINT "BonusSpendingHold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusSpendingHold" ADD CONSTRAINT "BonusSpendingHold_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Balance" ADD CONSTRAINT "Balance_nonnegative_counters" CHECK ("value" >= 0 AND "pendingRewardValue" >= 0 AND "spendingHoldValue" >= 0 AND "debtValue" >= 0);
ALTER TABLE "ProductRewardShare" ADD CONSTRAINT "ProductRewardShare_valid_share" CHECK ("depth" >= 0 AND "shareBasisPoints" >= 0 AND "shareBasisPoints" <= 10000);
ALTER TABLE "ReferralReward" ADD CONSTRAINT "ReferralReward_valid_amounts" CHECK ("amount" >= 0 AND "reversedAmount" >= 0 AND "reversedAmount" <= "amount");
ALTER TABLE "BonusSpendingHold" ADD CONSTRAINT "BonusSpendingHold_positive_amount" CHECK ("amount" >= 0);

CREATE FUNCTION prevent_balance_operation_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'BalanceOperation is immutable';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "BalanceOperation_immutable_update"
BEFORE UPDATE ON "BalanceOperation" FOR EACH ROW EXECUTE FUNCTION prevent_balance_operation_mutation();
CREATE TRIGGER "BalanceOperation_immutable_delete"
BEFORE DELETE ON "BalanceOperation" FOR EACH ROW EXECUTE FUNCTION prevent_balance_operation_mutation();
