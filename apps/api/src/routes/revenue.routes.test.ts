import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

const app = createApp();

const newRecord = {
  employeeId: "emp_001",
  period: "2099-01",
  revenueAmount: 12345,
};

describe("Revenue routes", () => {
  it("lists existing revenue records", async () => {
    const res = await request(app).get("/api/revenue").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("creates, updates and deletes a revenue record", async () => {
    const createRes = await request(app).post("/api/revenue").set("Cookie", authCookie()).send(newRecord);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/revenue/${id}`)
      .set("Cookie", authCookie())
      .send({ revenueAmount: 999 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.revenueAmount).toBe(999);

    const deleteRes = await request(app).delete(`/api/revenue/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);
  });

  it("returns 400 for an invalid period format", async () => {
    const res = await request(app)
      .post("/api/revenue")
      .set("Cookie", authCookie())
      .send({ ...newRecord, period: "2024/01" });
    expect(res.status).toBe(400);
  });
});
