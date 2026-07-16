import { createCrudRepository } from "../lib/crudRepository";
import { Employee } from "../types/domain";

export const employeeService = createCrudRepository<Employee>("employees.json", "emp");
