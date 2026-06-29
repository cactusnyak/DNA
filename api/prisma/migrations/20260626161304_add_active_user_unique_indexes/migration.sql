DROP INDEX IF EXISTS "User_email_key";
DROP INDEX IF EXISTS "User_referralCode_key";

CREATE UNIQUE INDEX "User_active_email_key"
ON "User" ("email")
WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "User_active_referralCode_key"
ON "User" ("referralCode")
WHERE "deletedAt" IS NULL AND "referralCode" IS NOT NULL;
