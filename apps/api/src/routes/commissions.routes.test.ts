import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { readData, writeData } from "../lib/jsonStore";
import { CommissionResult } from "../types/domain";

const app = createApp();
const PERIOD = "2099-02";
let revenueId: string;

describe("Commissions routes", () => {
  afterAll(async () => {
    if (revenueId) await request(app).delete(`/api/revenue/${revenueId}`);

    const results = await readData<CommissionResult[]>("commissionResults.json");
    await writeData(
      "commissionResults.json",
      results.filter((r) => r.period !== PERIOD)
    );
  });

  it("calculates commissions for a period, lists them and moves through the status workflow", async () => {
    const revenueRes = await request(app)
      .post("/api/revenue")
      .send({ employeeId: "emp_002", period: PERIOD, revenueAmount: 20000 });
    expect(revenueRes.status).toBe(201);
    revenueId = revenueRes.body.id;

    const calcRes = await request(app).post("/api/commissions/calculate").send({ period: PERIOD });
    expect(calcRes.status).toBe(200);
    const entry = calcRes.body.find((r: { employeeId: string }) => r.employeeId === "emp_002");
    expect(entry).toBeDefined();
    expect(entry.status).toBe("pending");

    const listRes = await request(app).get(`/api/commissions?period=${PERIOD}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.length).toBeGreaterThan(0);

    const approveRes = await request(app).patch(`/api/commissions/emp_002/${PERIOD}/status`).send({ status: "approved" });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe("approved");

    const invalidRes = await request(app).patch(`/api/commissions/emp_002/${PERIOD}/status`).send({ status: "pending" });
    expect(invalidRes.status).toBe(400);
  });

  it("returns 400 for an invalid calculate payload", async () => {
    const res = await request(app).post("/api/commissions/calculate").send({ period: "bad" });
    expect(res.status).toBe(400);
  });
});
