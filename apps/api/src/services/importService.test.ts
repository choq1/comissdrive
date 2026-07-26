import { describe, expect, it } from "vitest";
import { commitImport } from "./importService";
import { prisma } from "../lib/prisma";

describe("importService.commitImport", () => {
  it("grava apenas as linhas válidas de um lote parcialmente inválido e registra o ImportLog", async () => {
    const rows = [
      { code: "IMP001", name: "Importado Um", role: "Vendedor", department: "Vendas", baseSalary: 2000, tier: "Gold", status: "active" },
      { code: "IMP002", name: "", role: "Vendedor", department: "Vendas", baseSalary: 2000, tier: "Gold", status: "active" },
    ];

    const result = await commitImport("employee", rows, {
      fileName: "teste.xlsx",
      uploadedBy: "user_001",
      source: "spreadsheet",
    });

    expect(result.committed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors[0].rowIndex).toBe(1);

    const created = await prisma.employee.findFirst({ where: { code: "IMP001" } });
    expect(created).not.toBeNull();

    const logs = await prisma.importLog.findMany({ where: { fileName: "teste.xlsx" } });
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1]).toMatchObject({ entity: "employee", rowsCommitted: 1, rowsFailed: 1 });

    if (created) await prisma.employee.delete({ where: { id: created.id } });
  });

  it("não grava nada quando todas as linhas são inválidas", async () => {
    const rows = [{ code: "", name: "", role: "", department: "", baseSalary: -1, tier: "Bronze", status: "unknown" }];

    const result = await commitImport("employee", rows, {
      fileName: "teste-invalido.xlsx",
      uploadedBy: "user_001",
      source: "spreadsheet",
    });

    expect(result.committed).toBe(0);
    expect(result.failed).toBe(1);
  });
});
