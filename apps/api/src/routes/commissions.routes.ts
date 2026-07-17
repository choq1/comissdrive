import { Router } from "express";
import { commissionController } from "../controllers/commissionController";
import { requireAuth, requireRole } from "../middleware/auth";

export const commissionsRouter = Router();

commissionsRouter.get("/", requireAuth, commissionController.list);
commissionsRouter.post("/calculate", requireAuth, requireRole("admin"), commissionController.calculate);
commissionsRouter.patch(
  "/:employeeId/:period/status",
  requireAuth,
  requireRole("admin"),
  commissionController.updateStatus
);
