import { CommissionRule, CommissionTier, User } from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/** Variante de apiFetch para uso em Client Components: repassa o cookie de sessão via credentials:"include". */
export async function apiFetchClient<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function createRule(input: Omit<CommissionRule, "id">) {
  return apiFetchClient<CommissionRule>("/api/rules", { method: "POST", body: JSON.stringify(input) });
}

export function updateRule(id: string, patch: Partial<Omit<CommissionRule, "id">>) {
  return apiFetchClient<CommissionRule>(`/api/rules/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteRule(id: string) {
  return apiFetchClient<void>(`/api/rules/${id}`, { method: "DELETE" });
}

export function createTier(input: Omit<CommissionTier, "id">) {
  return apiFetchClient<CommissionTier>("/api/rules/tiers", { method: "POST", body: JSON.stringify(input) });
}

export function updateTier(id: string, patch: Partial<Omit<CommissionTier, "id">>) {
  return apiFetchClient<CommissionTier>(`/api/rules/tiers/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteTier(id: string) {
  return apiFetchClient<void>(`/api/rules/tiers/${id}`, { method: "DELETE" });
}

export function createUser(input: Omit<User, "id"> & { password: string }) {
  return apiFetchClient<User>("/api/users", { method: "POST", body: JSON.stringify(input) });
}

export function updateUser(id: string, patch: Partial<Omit<User, "id">> & { password?: string }) {
  return apiFetchClient<User>(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteUser(id: string) {
  return apiFetchClient<void>(`/api/users/${id}`, { method: "DELETE" });
}

export function login(email: string, password: string) {
  return apiFetchClient<User>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout() {
  return apiFetchClient<void>("/api/auth/logout", { method: "POST" });
}
