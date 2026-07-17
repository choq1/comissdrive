import { Router } from "express";
import { commissionRuleController } from "../controllers/commissionRuleController";
import { requireAuth, requireRole } from "../middleware/auth";

export const rulesRouter = Router();

rulesRouter.get("/", requireAuth, commissionRuleController.list);
rulesRouter.get("/tiers", requireAuth, commissionRuleController.listTiers);
rulesRouter.post("/tiers", requireAuth, requireRole("admin"), commissionRuleController.createTier);
rulesRouter.put("/tiers/:id", requireAuth, requireRole("admin"), commissionRuleController.updateTier);
rulesRouter.delete("/tiers/:id", requireAuth, requireRole("admin"), commissionRuleController.removeTier);
rulesRouter.get("/:id", requireAuth, commissionRuleController.getById);
rulesRouter.post("/", requireAuth, requireRole("admin"), commissionRuleController.create);
rulesRouter.put("/:id", requireAuth, requireRole("admin"), commissionRuleController.update);
rulesRouter.delete("/:id", requireAuth, requireRole("admin"), commissionRuleController.remove);
