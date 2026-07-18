import { createCrudRepository } from "../lib/crudRepository";
import { prisma } from "../lib/prisma";
import { Invoice } from "../types/domain";

export const invoiceService = createCrudRepository<Invoice>(prisma.invoice, "inv");
