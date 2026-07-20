-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_login_idx" ON "OtpCode"("login");

-- CreateIndex
CREATE INDEX "OtpCode_code_idx" ON "OtpCode"("code");

-- CreateIndex
CREATE INDEX "OtpCode_login_code_idx" ON "OtpCode"("login", "code");
