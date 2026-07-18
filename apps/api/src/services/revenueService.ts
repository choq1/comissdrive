import { createCrudRepository } from "../lib/crudRepository";
import { prisma } from "../lib/prisma";
import { RevenueRecord } from "../types/domain";

export const revenueService = createCrudRepository<RevenueRecord>(prisma.revenueRecord, "rev");
