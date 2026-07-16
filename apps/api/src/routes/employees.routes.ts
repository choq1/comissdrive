import { Router } from "express";
import { employeeController } from "../controllers/employeeController";

export const employeesRouter = Router();

employeesRouter.get("/", employeeController.list);
employeesRouter.get("/:id", employeeController.getById);
employeesRouter.post("/", employeeController.create);
employeesRouter.put("/:id", employeeController.update);
employeesRouter.delete("/:id", employeeController.remove);
