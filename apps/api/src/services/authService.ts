import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userService } from "./userService";
import { HttpError } from "../middleware/errorHandler";
import { User } from "../types/domain";

const TOKEN_TTL = "8h";

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await userService.findByEmail(email);
    if (!user) throw new HttpError(401, "Invalid credentials");

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) throw new HttpError(401, "Invalid credentials");

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? "changeme", {
      expiresIn: TOKEN_TTL,
    });

    return { user, token };
  },
};
