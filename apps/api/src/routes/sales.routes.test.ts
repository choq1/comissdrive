import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";
import { prisma } from "../lib/prisma";

const app = createApp();

const newSale = {
  employeeId: "emp_001",
  date: "2099-05-10",
  store: "Loja Centro",
  itemDescription: "Produto de teste",
  quantity: 2,
  grossAmount: 1000,
  netAmount: 900,
};

describe("Sales routes", () => {
  it("lista vendas", async () => {
    const res = await request(app).get("/api/sales").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("retorna 401 sem sessão", async () => {
    const res = await request(app).get("/api/sales");
    expect(res.status).toBe(401);
  });

  it("retorna 403 para um manager tentando criar", async () => {
    const res = await request(app).post("/api/sales").set("Cookie", authCookie("manager")).send(newSale);
    expect(res.status).toBe(403);
  });

  it("cria uma venda, deriva o período de `date`, recalcula o RevenueRecord, atualiza e exclui", async () => {
    const createRes = await request(app).post("/api/sales").set("Cookie", authCookie()).send(newSale);
    expect(createRes.status).toBe(201);
    expect(createRes.body.period).toBe("2099-05");
    const id = createRes.body.id;

    const revenueAfterCreate = await prisma.revenueRecord.findUnique({
      where: { employeeId_period: { employeeId: "emp_001", period: "2099-05" } },
    });
    expect(revenueAfterCreate?.revenueAmount).toBe(900);

    const updateRes = await request(app)
      .put(`/api/sales/${id}`)
      .set("Cookie", authCookie())
      .send({ netAmount: 1500 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.netAmount).toBe(1500);

    const revenueAfterUpdate = await prisma.revenueRecord.findUnique({
      where: { employeeId_period: { employeeId: "emp_001", period: "2099-05" } },
    });
    expect(revenueAfterUpdate?.revenueAmount).toBe(1500);

    const deleteRes = await request(app).delete(`/api/sales/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);

    const revenueAfterDelete = await prisma.revenueRecord.findUnique({
      where: { employeeId_period: { employeeId: "emp_001", period: "2099-05" } },
    });
    expect(revenueAfterDelete?.revenueAmount).toBe(0);

    await prisma.revenueRecord.deleteMany({ where: { employeeId: "emp_001", period: "2099-05" } });
  });

  it("retorna o ranking de itens agregado por descrição", async () => {
    const saleA = await request(app)
      .post("/api/sales")
      .set("Cookie", authCookie())
      .send({ ...newSale, itemDescription: "Item Ranking Teste", netAmount: 300, date: "2099-06-01" });
    const saleB = await request(app)
      .post("/api/sales")
      .set("Cookie", authCookie())
      .send({ ...newSale, itemDescription: "Item Ranking Teste", netAmount: 500, date: "2099-06-15" });

    const rankingRes = await request(app)
      .get("/api/sales/ranking")
      .query({ period: "2099-06" })
      .set("Cookie", authCookie());

    expect(rankingRes.status).toBe(200);
    const entry = rankingRes.body.find((r: { itemDescription: string }) => r.itemDescription === "Item Ranking Teste");
    expect(entry).toMatchObject({ totalNet: 800, salesCount: 2 });

    await request(app).delete(`/api/sales/${saleA.body.id}`).set("Cookie", authCookie());
    await request(app).delete(`/api/sales/${saleB.body.id}`).set("Cookie", authCookie());
    await prisma.revenueRecord.deleteMany({ where: { employeeId: "emp_001", period: "2099-06" } });
  });
});
