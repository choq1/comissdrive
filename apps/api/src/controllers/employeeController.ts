import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { employeeService } from "../services/employeeService";
import { employeeSchema, employeeUpdateSchema } from "../schemas/employee.schema";
import { HttpError } from "../middleware/errorHandler";

function isDuplicateCodeError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export const employeeController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await employeeService.list());
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const employee = await employeeService.findById(req.params.id);
      if (!employee) throw new HttpError(404, "Employee not found");
      res.json(employee);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = employeeSchema.parse(req.body);
      const employee = await employeeService.create(input);
      res.status(201).json(employee);
    } catch (err) {
      if (isDuplicateCodeError(err)) {
        next(new HttpError(409, "Já existe um funcionário cadastrado com esse código"));
        return;
      }
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const patch = employeeUpdateSchema.parse(req.body);
      const employee = await employeeService.update(req.params.id, patch);
      if (!employee) throw new HttpError(404, "Employee not found");
      res.json(employee);
    } catch (err) {
      if (isDuplicateCodeError(err)) {
        next(new HttpError(409, "Já existe um funcionário cadastrado com esse código"));
        return;
      }
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await employeeService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "Employee not found");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
