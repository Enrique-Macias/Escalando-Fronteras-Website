-- CreateTable
CREATE TABLE "UsedToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedToken_token_key" ON "UsedToken"("token");
