-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");
