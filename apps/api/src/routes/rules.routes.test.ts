import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

const app = createApp();

const newRule = {
  name: "Test Rule",
  type: "base",
  scope: "global",
  appliesTo: null,
  percentage: 3,
  threshold: null,
};

describe("Commission rules routes", () => {
  it("lists existing rules", async () => {
    const res = await request(app).get("/api/rules");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("lists tiers", async () => {
    const res = await request(app).get("/api/rules/tiers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates, updates and deletes a rule", async () => {
    const createRes = await request(app).post("/api/rules").send(newRule);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app).put(`/api/rules/${id}`).send({ percentage: 7 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.percentage).toBe(7);

    const deleteRes = await request(app).delete(`/api/rules/${id}`);
    expect(deleteRes.status).toBe(204);
  });
});
