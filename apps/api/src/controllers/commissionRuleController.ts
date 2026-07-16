import { NextFunction, Request, Response } from "express";
import { commissionRuleService } from "../services/commissionRuleService";
import { commissionRuleSchema, commissionRuleUpdateSchema } from "../schemas/rule.schema";
import { HttpError } from "../middleware/errorHandler";

export const commissionRuleController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await commissionRuleService.list());
    } catch (err) {
      next(err);
    }
  },

  async listTiers(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await commissionRuleService.listTiers());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const rule = await commissionRuleService.findById(req.params.id);
      if (!rule) throw new HttpError(404, "Commission rule not found");
      res.json(rule);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = commissionRuleSchema.parse(req.body);
      const rule = await commissionRuleService.create(input);
      res.status(201).json(rule);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = commissionRuleUpdateSchema.parse(req.body);
      const rule = await commissionRuleService.update(req.params.id, patch);
      if (!rule) throw new HttpError(404, "Commission rule not found");
      res.json(rule);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await commissionRuleService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "Commission rule not found");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
