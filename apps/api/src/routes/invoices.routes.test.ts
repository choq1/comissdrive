import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

const app = createApp();

const newInvoice = {
  employeeId: "emp_001",
  period: "2024-05",
  amount: 500,
  status: "pending",
  dueDate: "2024-05-30",
};

describe("Invoices routes", () => {
  it("lists existing invoices", async () => {
    const res = await request(app).get("/api/invoices").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates, updates and deletes an invoice", async () => {
    const createRes = await request(app).post("/api/invoices").set("Cookie", authCookie()).send(newInvoice);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/invoices/${id}`)
      .set("Cookie", authCookie())
      .send({ status: "paid" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("paid");

    const deleteRes = await request(app).delete(`/api/invoices/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);
  });

  it("returns 404 when deleting an unknown invoice", async () => {
    const res = await request(app).delete("/api/invoices/does-not-exist").set("Cookie", authCookie());
    expect(res.status).toBe(404);
  });
});
