import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { userService, toPublicUser } from "../services/userService";
import { userSchema, userUpdateSchema } from "../schemas/user.schema";
import { HttpError } from "../middleware/errorHandler";
import { User } from "../types/domain";

const SALT_ROUNDS = 10;

export const userController = {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.list();
      res.json(users.map(toPublicUser));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      if (!user) throw new HttpError(404, "User not found");
      res.json(toPublicUser(user));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, employeeId, ...input } = userSchema.parse(req.body);
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await userService.create({ ...input, employeeId: employeeId ?? undefined, passwordHash });
      res.status(201).json(toPublicUser(user));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { password, employeeId, ...rest } = userUpdateSchema.parse(req.body);
      const patch: Partial<Omit<User, "id">> = { ...rest };
      if (employeeId !== undefined) patch.employeeId = employeeId ?? undefined;
      if (password) {
        patch.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      }
      const user = await userService.update(req.params.id, patch);
      if (!user) throw new HttpError(404, "User not found");
      res.json(toPublicUser(user));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const removed = await userService.remove(req.params.id);
      if (!removed) throw new HttpError(404, "User not found");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
