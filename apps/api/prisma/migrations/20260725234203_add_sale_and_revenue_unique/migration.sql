
-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "store" TEXT NOT NULL,
    "itemDescription" TEXT NOT NULL,
    "itemSku" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sale_employeeId_period_idx" ON "Sale"("employeeId", "period");

-- CreateIndex
CREATE INDEX "Sale_itemDescription_idx" ON "Sale"("itemDescription");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueRecord_employeeId_period_key" ON "RevenueRecord"("employeeId", "period");

