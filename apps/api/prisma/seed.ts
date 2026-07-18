import { Prisma, PrismaClient } from "@prisma/client";
import employees from "./seed-data/employees.json";
import users from "./seed-data/users.json";
import revenue from "./seed-data/revenue.json";
import invoices from "./seed-data/invoices.json";
import rules from "./seed-data/rules.json";
import commissionResults from "./seed-data/commissionResults.json";

const prisma = new PrismaClient();

async function main() {
  await prisma.employee.createMany({ data: employees as Prisma.EmployeeCreateManyInput[] });
  await prisma.user.createMany({ data: users as Prisma.UserCreateManyInput[] });
  await prisma.revenueRecord.createMany({ data: revenue as Prisma.RevenueRecordCreateManyInput[] });
  await prisma.invoice.createMany({ data: invoices as Prisma.InvoiceCreateManyInput[] });
  await prisma.commissionRule.createMany({ data: rules.rules as Prisma.CommissionRuleCreateManyInput[] });
  await prisma.commissionTier.createMany({ data: rules.tiers as Prisma.CommissionTierCreateManyInput[] });
  await prisma.commissionResult.createMany({ data: commissionResults as Prisma.CommissionResultCreateManyInput[] });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
