import { apiFetch } from "./api";
import { User } from "@/types/domain";

export async function getCurrentUser(): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/auth/me");
  } catch {
    return null;
  }
}
