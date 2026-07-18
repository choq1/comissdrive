import { createCrudRepository } from "../lib/crudRepository";
import { prisma } from "../lib/prisma";
import { Employee } from "../types/domain";

export const employeeService = createCrudRepository<Employee>(prisma.employee, "emp");
