import { createCrudRepository } from "../lib/crudRepository";
import { Invoice } from "../types/domain";

export const invoiceService = createCrudRepository<Invoice>("invoices.json", "inv");
