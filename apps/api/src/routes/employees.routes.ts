import { Router } from "express";
import { employeeController } from "../controllers/employeeController";
import { requireAuth, requireRole } from "../middleware/auth";

export const employeesRouter = Router();

employeesRouter.get("/", requireAuth, employeeController.list);
employeesRouter.get("/:id", requireAuth, employeeController.getById);
employeesRouter.post("/", requireAuth, requireRole("admin"), employeeController.create);
employeesRouter.put("/:id", requireAuth, requireRole("admin"), employeeController.update);
employeesRouter.delete("/:id", requireAuth, requireRole("admin"), employeeController.remove);
