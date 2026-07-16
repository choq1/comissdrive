import { Router } from "express";
import { invoiceController } from "../controllers/invoiceController";

export const invoicesRouter = Router();

invoicesRouter.get("/", invoiceController.list);
invoicesRouter.get("/:id", invoiceController.getById);
invoicesRouter.post("/", invoiceController.create);
invoicesRouter.put("/:id", invoiceController.update);
invoicesRouter.delete("/:id", invoiceController.remove);
