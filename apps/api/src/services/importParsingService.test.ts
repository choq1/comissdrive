import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { parseUploadedFile } from "./importParsingService";
import { employeeImportConfig } from "../schemas/importConfigs";

async function bufferFromRows(headers: string[], rows: (string | number)[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("dados");
  worksheet.addRow(headers);
  rows.forEach((row) => worksheet.addRow(row));
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

describe("importParsingService", () => {
  it("mapeia cabeçalhos em PT-BR para os campos do schema", async () => {
    const buffer = await bufferFromRows(
      ["Código", "Nome", "Cargo", "Departamento", "Salário base", "Tier", "Status"],
      [["E100", "Fulano", "Vendedor", "Vendas", 3000, "Ouro", "Ativo"]]
    );

    const rows = await parseUploadedFile(buffer, "application/vnd.openxmlformats", "test.xlsx", employeeImportConfig);

    expect(rows).toHaveLength(1);
    expect(rows[0].errors).toEqual([]);
    expect(rows[0].data).toMatchObject({
      code: "E100",
      name: "Fulano",
      role: "Vendedor",
      department: "Vendas",
      baseSalary: 3000,
      tier: "Gold",
      status: "active",
    });
  });

  it("também aceita cabeçalhos em inglês como alias", async () => {
    const buffer = await bufferFromRows(
      ["code", "name", "role", "department", "base salary", "tier", "status"],
      [["E101", "Beltrano", "Analyst", "Sales", "1.500,50", "Silver", "active"]]
    );

    const rows = await parseUploadedFile(buffer, "application/vnd.openxmlformats", "test.xlsx", employeeImportConfig);

    expect(rows[0].errors).toEqual([]);
    expect(rows[0].data.baseSalary).toBe(1500.5);
  });

  it("aceita valores no formato EN (ponto decimal simples) sem corromper o número", async () => {
    const buffer = await bufferFromRows(
      ["Código", "Nome", "Cargo", "Departamento", "Salário base", "Tier", "Status"],
      [["E104", "Fulano EN", "Vendedor", "Vendas", "2800.50", "Gold", "active"]]
    );

    const rows = await parseUploadedFile(buffer, "application/vnd.openxmlformats", "test.xlsx", employeeImportConfig);

    expect(rows[0].errors).toEqual([]);
    expect(rows[0].data.baseSalary).toBe(2800.5);
  });

  it("reporta erro por linha em português quando falta um campo obrigatório", async () => {
    const buffer = await bufferFromRows(
      ["Código", "Nome", "Cargo", "Departamento", "Salário base", "Tier", "Status"],
      [["E102", "", "Vendedor", "Vendas", 3000, "Gold", "active"]]
    );

    const rows = await parseUploadedFile(buffer, "application/vnd.openxmlformats", "test.xlsx", employeeImportConfig);

    expect(rows[0].errors).toHaveLength(1);
    expect(rows[0].errors[0]).toMatchObject({ field: "name" });
    expect(rows[0].errors[0].message).toContain("Nome");
  });

  it("ignora linhas totalmente vazias", async () => {
    const buffer = await bufferFromRows(
      ["Código", "Nome", "Cargo", "Departamento", "Salário base", "Tier", "Status"],
      [
        ["E103", "Ciclano", "Vendedor", "Vendas", 3000, "Gold", "active"],
        ["", "", "", "", "", "", ""],
      ]
    );

    const rows = await parseUploadedFile(buffer, "application/vnd.openxmlformats", "test.xlsx", employeeImportConfig);

    expect(rows).toHaveLength(1);
  });
});
