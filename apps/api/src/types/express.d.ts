import { UserRole } from "./domain";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: UserRole };
    }
  }
}

export {};
