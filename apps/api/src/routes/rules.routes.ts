import { Router } from "express";
import { commissionRuleController } from "../controllers/commissionRuleController";

export const rulesRouter = Router();

rulesRouter.get("/", commissionRuleController.list);
rulesRouter.get("/tiers", commissionRuleController.listTiers);
rulesRouter.get("/:id", commissionRuleController.getById);
rulesRouter.post("/", commissionRuleController.create);
rulesRouter.put("/:id", commissionRuleController.update);
rulesRouter.delete("/:id", commissionRuleController.remove);
