import { createCrudRepository } from "../lib/crudRepository";
import { prisma } from "../lib/prisma";
import { Sale } from "../types/domain";

export const saleService = createCrudRepository<Sale>(prisma.sale, "sale");
