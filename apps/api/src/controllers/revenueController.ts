import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { revenueService } from "../services/revenueService";
import { revenueSchema, revenueUpdateSchema } from "../schemas/revenue.schema";
import { HttpError } from "../middleware/errorHandler";

export const revenueController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await revenueService.list());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await revenueService.findById(req.params.id);
      if (!record) throw new HttpError(404, "Revenue record not found");
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = revenueSchema.parse(req.body);
      const record = await revenueService.create(input);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        next(new HttpError(409, "Já existe um registro de faturamento para esse funcionário/período"));
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = revenueUpdateSchema.parse(req.body);
      const record = await revenueService.update(req.params.id, patch);
      if (!record) throw new HttpError(404, "Revenue record not found");
      res.json(record);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await revenueService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "Revenue record not found");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
