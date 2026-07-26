import { Router } from "express";
import { saleController } from "../controllers/saleController";
import { requireAuth, requireRole } from "../middleware/auth";

export const salesRouter = Router();

salesRouter.get("/ranking", requireAuth, saleController.ranking);
salesRouter.get("/", requireAuth, saleController.list);
salesRouter.get("/:id", requireAuth, saleController.getById);
salesRouter.post("/", requireAuth, requireRole("admin"), saleController.create);
salesRouter.put("/:id", requireAuth, requireRole("admin"), saleController.update);
salesRouter.delete("/:id", requireAuth, requireRole("admin"), saleController.remove);
