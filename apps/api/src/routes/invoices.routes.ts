import { Router } from "express";
import { invoiceController } from "../controllers/invoiceController";
import { requireAuth, requireRole } from "../middleware/auth";

export const invoicesRouter = Router();

invoicesRouter.get("/", requireAuth, invoiceController.list);
invoicesRouter.get("/:id", requireAuth, invoiceController.getById);
invoicesRouter.post("/", requireAuth, requireRole("admin"), invoiceController.create);
invoicesRouter.put("/:id", requireAuth, requireRole("admin"), invoiceController.update);
invoicesRouter.delete("/:id", requireAuth, requireRole("admin"), invoiceController.remove);
