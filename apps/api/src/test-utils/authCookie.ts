import jwt from "jsonwebtoken";
import { UserRole } from "../types/domain";

export function authCookie(role: UserRole = "admin", sub = "user_001") {
  const token = jwt.sign({ sub, role }, process.env.JWT_SECRET ?? "changeme", { expiresIn: "1h" });
  return [`token=${token}`];
}
