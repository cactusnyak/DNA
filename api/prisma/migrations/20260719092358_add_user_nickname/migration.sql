/*
  Warnings:

  - A unique constraint covering the columns `[nicknameSuffix]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- Add columns as nullable first so existing rows can be populated.
ALTER TABLE "User" ADD COLUMN "nickname" TEXT,
ADD COLUMN "nicknameSuffix" TEXT NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- Populate nickname from first name, falling back to email local-part or a generic placeholder.
UPDATE "User"
SET "nickname" = COALESCE(NULLIF(TRIM("firstName"), ''), SPLIT_PART("email", '@', 1), 'user')
WHERE "nickname" IS NULL;

-- Make nickname required now that every row has a value.
ALTER TABLE "User" ALTER COLUMN "nickname" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_nicknameSuffix_key" ON "User"("nicknameSuffix");
