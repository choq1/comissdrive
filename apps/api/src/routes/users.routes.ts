import { Router } from "express";
import { userController } from "../controllers/userController";
import { requireAuth, requireRole } from "../middleware/auth";

export const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRole("admin"), userController.list);
usersRouter.get("/:id", requireAuth, requireRole("admin"), userController.getById);
usersRouter.post("/", requireAuth, requireRole("admin"), userController.create);
usersRouter.put("/:id", requireAuth, requireRole("admin"), userController.update);
usersRouter.delete("/:id", requireAuth, requireRole("admin"), userController.remove);
