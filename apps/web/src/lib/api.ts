import { cookies } from "next/headers";
import {
  CommissionResult,
  CommissionRule,
  CommissionTier,
  Employee,
  Invoice,
  ItemRankingRow,
  RevenueRecord,
  Sale,
  User,
} from "@/types/domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/** Usado por Server Components: repassa o cookie de sessão recebido na request atual. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `token=${token}` } : {}),
    },
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function getEmployees() {
  return apiFetch<Employee[]>("/api/employees");
}

export function getInvoices() {
  return apiFetch<Invoice[]>("/api/invoices");
}

export function getRevenue() {
  return apiFetch<RevenueRecord[]>("/api/revenue");
}

export function getCommissionRules() {
  return apiFetch<CommissionRule[]>("/api/rules");
}

export function getCommissionTiers() {
  return apiFetch<CommissionTier[]>("/api/rules/tiers");
}

export function getCommissionResults(params?: { period?: string; employeeId?: string }) {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.employeeId) query.set("employeeId", params.employeeId);
  const qs = query.toString();
  return apiFetch<CommissionResult[]>(`/api/commissions${qs ? `?${qs}` : ""}`);
}

export function getUsers() {
  return apiFetch<User[]>("/api/users");
}

export function getSales() {
  return apiFetch<Sale[]>("/api/sales");
}

export function getItemRanking(params?: { period?: string; store?: string; employeeId?: string }) {
  const query = new URLSearchParams();
  if (params?.period) query.set("period", params.period);
  if (params?.store) query.set("store", params.store);
  if (params?.employeeId) query.set("employeeId", params.employeeId);
  const qs = query.toString();
  return apiFetch<ItemRankingRow[]>(`/api/sales/ranking${qs ? `?${qs}` : ""}`);
}
