import { NextFunction, Request, Response } from "express";
import { commissionResultService } from "../services/commissionResultService";
import { calculatePeriodSchema, commissionStatusUpdateSchema } from "../schemas/commissionStatus.schema";

export const commissionController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, employeeId } = req.query;
      const results = await commissionResultService.list({
        period: typeof period === "string" ? period : undefined,
        employeeId: typeof employeeId === "string" ? employeeId : undefined,
      });
      res.json(results);
    } catch (err) {
      next(err);
    }
  },

  async calculate(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = calculatePeriodSchema.parse(req.body);
      const results = await commissionResultService.calculateForPeriod(period);
      res.json(results);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = commissionStatusUpdateSchema.parse(req.body);
      const result = await commissionResultService.updateStatus(req.params.employeeId, req.params.period, status);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
