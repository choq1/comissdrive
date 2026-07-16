import { NextFunction, Request, Response } from "express";
import { invoiceService } from "../services/invoiceService";
import { invoiceSchema, invoiceUpdateSchema } from "../schemas/invoice.schema";
import { HttpError } from "../middleware/errorHandler";

export const invoiceController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await invoiceService.list());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.findById(req.params.id);
      if (!invoice) throw new HttpError(404, "Invoice not found");
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = invoiceSchema.parse(req.body);
      const invoice = await invoiceService.create(input);
      res.status(201).json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = invoiceUpdateSchema.parse(req.body);
      const invoice = await invoiceService.update(req.params.id, patch);
      if (!invoice) throw new HttpError(404, "Invoice not found");
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await invoiceService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "Invoice not found");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
