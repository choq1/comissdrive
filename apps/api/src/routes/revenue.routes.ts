import { Router } from "express";
import { revenueController } from "../controllers/revenueController";
import { requireAuth, requireRole } from "../middleware/auth";

export const revenueRouter = Router();

revenueRouter.get("/", requireAuth, revenueController.list);
revenueRouter.get("/:id", requireAuth, revenueController.getById);
revenueRouter.post("/", requireAuth, requireRole("admin"), revenueController.create);
revenueRouter.put("/:id", requireAuth, requireRole("admin"), revenueController.update);
revenueRouter.delete("/:id", requireAuth, requireRole("admin"), revenueController.remove);
