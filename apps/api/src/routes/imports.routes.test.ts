import ExcelJS from "exceljs";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";
import { prisma } from "../lib/prisma";

const app = createApp();

async function buildRevenueWorkbookBuffer(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("dados");
  worksheet.addRow(["Funcionário", "Período", "Faturamento"]);
  worksheet.addRow(["E001", "2099-03", 5000]);
  worksheet.addRow(["NAO_EXISTE", "2099-03", 1000]);
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

describe("Imports routes", () => {
  it("retorna 401 sem sessão", async () => {
    const res = await request(app).post("/api/imports/revenue/preview");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para um manager", async () => {
    const buffer = await buildRevenueWorkbookBuffer();
    const res = await request(app)
      .post("/api/imports/revenue/preview")
      .set("Cookie", authCookie("manager"))
      .attach("file", buffer, "revenue.xlsx");
    expect(res.status).toBe(403);
  });

  it("retorna 400 para uma entidade inválida", async () => {
    const res = await request(app).post("/api/imports/foo/preview").set("Cookie", authCookie());
    expect(res.status).toBe(400);
  });

  it("analisa uma planilha de faturamento, aponta erro na linha com funcionário inexistente, e confirma a importação", async () => {
    const buffer = await buildRevenueWorkbookBuffer();

    const previewRes = await request(app)
      .post("/api/imports/revenue/preview")
      .set("Cookie", authCookie())
      .attach("file", buffer, "revenue.xlsx");

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.totalRows).toBe(2);
    expect(previewRes.body.validCount).toBe(1);
    expect(previewRes.body.errorCount).toBe(1);

    const validRows = previewRes.body.rows.filter((r: { errors: unknown[] }) => r.errors.length === 0);
    expect(validRows).toHaveLength(1);

    const commitRes = await request(app)
      .post("/api/imports/revenue/commit")
      .set("Cookie", authCookie())
      .send({ rows: validRows.map((r: { data: unknown }) => r.data), fileName: "revenue.xlsx" });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.committed).toBe(1);
    expect(commitRes.body.failed).toBe(0);

    const created = await prisma.revenueRecord.findFirst({ where: { employeeId: "emp_001", period: "2099-03" } });
    expect(created).not.toBeNull();
    if (created) await prisma.revenueRecord.delete({ where: { id: created.id } });
  });

  it("aceita período em formato brasileiro (MM/AAAA) na planilha", async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("dados");
    worksheet.addRow(["Funcionário", "Período", "Faturamento"]);
    worksheet.addRow(["E001", "03/2099", 5000]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const previewRes = await request(app)
      .post("/api/imports/revenue/preview")
      .set("Cookie", authCookie())
      .attach("file", buffer, "revenue-br.xlsx");

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.errorCount).toBe(0);
    expect(previewRes.body.rows[0].data.period).toBe("2099-03");
  });

  it("aceita período em formato brasileiro (DD/MM/AAAA) digitado manualmente no commit", async () => {
    const commitRes = await request(app)
      .post("/api/imports/revenue/commit")
      .set("Cookie", authCookie())
      .send({
        rows: [{ employeeId: "emp_001", period: "15/03/2099", revenueAmount: 7000 }],
        fileName: "correcao-manual.xlsx",
      });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.committed).toBe(1);
    expect(commitRes.body.failed).toBe(0);

    const created = await prisma.revenueRecord.findFirst({ where: { employeeId: "emp_001", period: "2099-03" } });
    expect(created).not.toBeNull();
    if (created) await prisma.revenueRecord.delete({ where: { id: created.id } });
  });

  it("rejeita no commit um employeeId que não corresponde a nenhum funcionário, mesmo digitado manualmente (regressão)", async () => {
    const commitRes = await request(app)
      .post("/api/imports/revenue/commit")
      .set("Cookie", authCookie())
      .send({
        rows: [{ employeeId: "Nome Que Não Existe", period: "2099-03", revenueAmount: 999 }],
        fileName: "correcao-invalida.xlsx",
      });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.committed).toBe(0);
    expect(commitRes.body.failed).toBe(1);
    expect(commitRes.body.errors[0].errors[0].message).toContain("não encontrado");

    const created = await prisma.revenueRecord.findFirst({ where: { employeeId: "Nome Que Não Existe" } });
    expect(created).toBeNull();
  });

  it("analisa e importa uma planilha de vendas, recalculando o RevenueRecord do par afetado", async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("dados");
    worksheet.addRow(["Funcionário", "Data", "Loja", "Descrição do item", "Quantidade", "Venda bruta", "Venda líquida"]);
    worksheet.addRow(["E001", "10/04/2099", "Loja Centro", "Camiseta", 2, 200, 180]);
    worksheet.addRow(["E001", "20/04/2099", "Loja Centro", "Calça", 1, 300, 270]);
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    const previewRes = await request(app)
      .post("/api/imports/sale/preview")
      .set("Cookie", authCookie())
      .attach("file", buffer, "vendas.xlsx");

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.errorCount).toBe(0);
    expect(previewRes.body.rows[0].data.period).toBe("2099-04");

    const commitRes = await request(app)
      .post("/api/imports/sale/commit")
      .set("Cookie", authCookie())
      .send({ rows: previewRes.body.rows.map((r: { data: unknown }) => r.data), fileName: "vendas.xlsx" });

    expect(commitRes.status).toBe(200);
    expect(commitRes.body.committed).toBe(2);

    const revenue = await prisma.revenueRecord.findUnique({
      where: { employeeId_period: { employeeId: "emp_001", period: "2099-04" } },
    });
    expect(revenue?.revenueAmount).toBe(450);

    await prisma.sale.deleteMany({ where: { employeeId: "emp_001", period: "2099-04" } });
    await prisma.revenueRecord.deleteMany({ where: { employeeId: "emp_001", period: "2099-04" } });
  });
});
