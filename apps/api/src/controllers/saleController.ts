import { NextFunction, Request, Response } from "express";
import { saleService } from "../services/saleService";
import { saleSchema, saleUpdateSchema } from "../schemas/sale.schema";
import { recomputeRevenueForPairs } from "../services/revenueAggregationService";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";

export const saleController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await saleService.list());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const sale = await saleService.findById(req.params.id);
      if (!sale) throw new HttpError(404, "Sale not found");
      res.json(sale);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // `period` é sempre derivado de `date` no servidor — o formulário manual não pede esse campo.
      const period = typeof req.body.date === "string" ? req.body.date.slice(0, 7) : undefined;
      const input = saleSchema.parse({ ...req.body, period });
      const sale = await saleService.create(input);
      await recomputeRevenueForPairs([{ employeeId: sale.employeeId, period: sale.period }]);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (typeof body.date === "string") body.period = body.date.slice(0, 7);
      const patch = saleUpdateSchema.parse(body);
      const existing = await saleService.findById(req.params.id);
      if (!existing) throw new HttpError(404, "Sale not found");

      const sale = await saleService.update(req.params.id, patch);
      if (!sale) throw new HttpError(404, "Sale not found");

      const pairs = [
        { employeeId: existing.employeeId, period: existing.period },
        { employeeId: sale.employeeId, period: sale.period },
      ];
      await recomputeRevenueForPairs(pairs);
      res.json(sale);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const existing = await saleService.findById(req.params.id);
      if (!existing) throw new HttpError(404, "Sale not found");

      const removed = await saleService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "Sale not found");

      await recomputeRevenueForPairs([{ employeeId: existing.employeeId, period: existing.period }]);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async ranking(req: Request, res: Response, next: NextFunction) {
    try {
      const { period, store, employeeId } = req.query;
      const where = {
        ...(typeof period === "string" ? { period } : {}),
        ...(typeof store === "string" ? { store } : {}),
        ...(typeof employeeId === "string" ? { employeeId } : {}),
      };

      const grouped = await prisma.sale.groupBy({
        by: ["itemDescription"],
        where,
        _sum: { netAmount: true, grossAmount: true, quantity: true },
        _count: { _all: true },
        orderBy: { _sum: { netAmount: "desc" } },
      });

      res.json(
        grouped.map((row) => ({
          itemDescription: row.itemDescription,
          totalNet: row._sum.netAmount ?? 0,
          totalGross: row._sum.grossAmount ?? 0,
          totalQuantity: row._sum.quantity ?? 0,
          salesCount: row._count._all,
        }))
      );
    } catch (err) {
      next(err);
    }
  },
};
