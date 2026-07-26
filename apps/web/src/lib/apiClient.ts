import { CommissionResult, CommissionRule, CommissionTier, Employee, Sale, User } from "@/types/domain";
import { ImportCommitResponse, ImportEntity, ImportPreviewResponse, RowResult } from "@/types/imports";

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

/** Variante para upload multipart — sem Content-Type manual, o browser gera o boundary sozinho. */
export async function apiFetchClientFormData<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

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

export function createEmployee(input: Omit<Employee, "id">) {
  return apiFetchClient<Employee>("/api/employees", { method: "POST", body: JSON.stringify(input) });
}

export function updateEmployee(id: string, patch: Partial<Omit<Employee, "id">>) {
  return apiFetchClient<Employee>(`/api/employees/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteEmployee(id: string) {
  return apiFetchClient<void>(`/api/employees/${id}`, { method: "DELETE" });
}

/** `period` nunca é enviado pelo client — o backend sempre deriva de `date`. */
export function createSale(input: Omit<Sale, "id" | "period">) {
  return apiFetchClient<Sale>("/api/sales", { method: "POST", body: JSON.stringify(input) });
}

export function updateSale(id: string, patch: Partial<Omit<Sale, "id" | "period">>) {
  return apiFetchClient<Sale>(`/api/sales/${id}`, { method: "PUT", body: JSON.stringify(patch) });
}

export function deleteSale(id: string) {
  return apiFetchClient<void>(`/api/sales/${id}`, { method: "DELETE" });
}

export function calculateCommissions(period: string) {
  return apiFetchClient<CommissionResult[]>("/api/commissions/calculate", {
    method: "POST",
    body: JSON.stringify({ period }),
  });
}

export function login(email: string, password: string) {
  return apiFetchClient<User>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function logout() {
  return apiFetchClient<void>("/api/auth/logout", { method: "POST" });
}

export function previewImport(entity: ImportEntity, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetchClientFormData<ImportPreviewResponse>(`/api/imports/${entity}/preview`, formData);
}

export function commitImportRows(entity: ImportEntity, rows: RowResult["data"][], fileName: string) {
  return apiFetchClient<ImportCommitResponse>(`/api/imports/${entity}/commit`, {
    method: "POST",
    body: JSON.stringify({ rows, fileName }),
  });
}
