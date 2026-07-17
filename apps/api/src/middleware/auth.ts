import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./errorHandler";
import { UserRole } from "../types/domain";

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    next(new HttpError(401, "Not authenticated"));
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "changeme") as AuthTokenPayload;
    req.user = { sub: payload.sub, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new HttpError(403, "Forbidden"));
      return;
    }
    next();
  };
}
