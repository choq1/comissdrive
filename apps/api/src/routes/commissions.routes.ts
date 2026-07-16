import { Router } from "express";
import { commissionController } from "../controllers/commissionController";

export const commissionsRouter = Router();

commissionsRouter.get("/", commissionController.list);
commissionsRouter.post("/calculate", commissionController.calculate);
commissionsRouter.patch("/:employeeId/:period/status", commissionController.updateStatus);
