-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CommissionTierLevel" AS ENUM ('Gold', 'Silver');

-- CreateEnum
CREATE TYPE "CommissionRuleType" AS ENUM ('base', 'volumeBonus', 'tiered');

-- CreateEnum
CREATE TYPE "CommissionRuleScope" AS ENUM ('department', 'role', 'global');

-- CreateEnum
CREATE TYPE "CommissionResultStatus" AS ENUM ('pending', 'approved', 'paid');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('pending', 'approved', 'paid');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'manager');

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "tier" "CommissionTierLevel" NOT NULL,
    "status" "EmployeeStatus" NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevenueRecord" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "revenueAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RevenueRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommissionRuleType" NOT NULL,
    "scope" "CommissionRuleScope" NOT NULL,
    "appliesTo" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION,

    CONSTRAINT "CommissionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionTier" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "minRevenue" DOUBLE PRECISION NOT NULL,
    "maxRevenue" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "CommissionTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionResult" (
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "appliedRules" TEXT[],
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "totalPay" DOUBLE PRECISION NOT NULL,
    "status" "CommissionResultStatus" NOT NULL,

    CONSTRAINT "CommissionResult_pkey" PRIMARY KEY ("employeeId","period")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL,
    "dueDate" TEXT NOT NULL,
    "paidDate" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "employeeId" TEXT,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CommissionTier" ADD CONSTRAINT "CommissionTier_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "CommissionRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
