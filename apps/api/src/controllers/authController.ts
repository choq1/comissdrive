import { NextFunction, Request, Response } from "express";
import { authService } from "../services/authService";
import { userService, toPublicUser } from "../services/userService";
import { loginSchema } from "../schemas/auth.schema";
import { HttpError } from "../middleware/errorHandler";

const COOKIE_MAX_AGE_MS = 8 * 60 * 60 * 1000;

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, token } = await authService.login(email, password);

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: COOKIE_MAX_AGE_MS,
      });
      res.json(toPublicUser(user));
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("token");
    res.status(204).send();
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.user!.sub);
      if (!user) throw new HttpError(401, "Not authenticated");
      res.json(toPublicUser(user));
    } catch (err) {
      next(err);
    }
  },
};
