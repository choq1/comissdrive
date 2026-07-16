import { Router } from "express";
import { revenueController } from "../controllers/revenueController";

export const revenueRouter = Router();

revenueRouter.get("/", revenueController.list);
revenueRouter.get("/:id", revenueController.getById);
revenueRouter.post("/", revenueController.create);
revenueRouter.put("/:id", revenueController.update);
revenueRouter.delete("/:id", revenueController.remove);
