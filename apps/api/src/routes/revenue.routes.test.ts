import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

const newRecord = {
  employeeId: "emp_001",
  period: "2099-01",
  revenueAmount: 12345,
};

describe("Revenue routes", () => {
  it("lists existing revenue records", async () => {
    const res = await request(app).get("/api/revenue");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("creates, updates and deletes a revenue record", async () => {
    const createRes = await request(app).post("/api/revenue").send(newRecord);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app).put(`/api/revenue/${id}`).send({ revenueAmount: 999 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.revenueAmount).toBe(999);

    const deleteRes = await request(app).delete(`/api/revenue/${id}`);
    expect(deleteRes.status).toBe(204);
  });

  it("returns 400 for an invalid period format", async () => {
    const res = await request(app).post("/api/revenue").send({ ...newRecord, period: "2024/01" });
    expect(res.status).toBe(400);
  });
});
