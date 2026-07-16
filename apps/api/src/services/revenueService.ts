import { createCrudRepository } from "../lib/crudRepository";
import { RevenueRecord } from "../types/domain";

export const revenueService = createCrudRepository<RevenueRecord>("revenue.json", "rev");
