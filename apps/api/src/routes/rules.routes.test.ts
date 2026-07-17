import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

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
    const res = await request(app).get("/api/rules").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("lists tiers", async () => {
    const res = await request(app).get("/api/rules/tiers").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("creates, updates and deletes a rule", async () => {
    const createRes = await request(app).post("/api/rules").set("Cookie", authCookie()).send(newRule);
    expect(createRes.status).toBe(201);
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/rules/${id}`)
      .set("Cookie", authCookie())
      .send({ percentage: 7 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.percentage).toBe(7);

    const deleteRes = await request(app).delete(`/api/rules/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);
  });

  it("creates, updates and deletes a tier", async () => {
    const ruleRes = await request(app)
      .post("/api/rules")
      .set("Cookie", authCookie())
      .send({ ...newRule, type: "tiered" });
    const ruleId = ruleRes.body.id;

    const createRes = await request(app)
      .post("/api/rules/tiers")
      .set("Cookie", authCookie())
      .send({ ruleId, tierName: "Tier 1", minRevenue: 0, maxRevenue: 10000, percentage: 3 });
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    const tierId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/rules/tiers/${tierId}`)
      .set("Cookie", authCookie())
      .send({ percentage: 8 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.percentage).toBe(8);

    const deleteRes = await request(app).delete(`/api/rules/tiers/${tierId}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);

    await request(app).delete(`/api/rules/${ruleId}`).set("Cookie", authCookie());
  });

  it("returns 404 when updating or deleting an unknown tier", async () => {
    const updateRes = await request(app)
      .put("/api/rules/tiers/does-not-exist")
      .set("Cookie", authCookie())
      .send({ percentage: 5 });
    expect(updateRes.status).toBe(404);

    const deleteRes = await request(app).delete("/api/rules/tiers/does-not-exist").set("Cookie", authCookie());
    expect(deleteRes.status).toBe(404);
  });

  it("cascades tier deletion when its rule is removed", async () => {
    const ruleRes = await request(app)
      .post("/api/rules")
      .set("Cookie", authCookie())
      .send({ ...newRule, type: "tiered" });
    const ruleId = ruleRes.body.id;

    const tierRes = await request(app)
      .post("/api/rules/tiers")
      .set("Cookie", authCookie())
      .send({ ruleId, tierName: "Tier 1", minRevenue: 0, maxRevenue: null, percentage: 3 });
    const tierId = tierRes.body.id;

    await request(app).delete(`/api/rules/${ruleId}`).set("Cookie", authCookie());

    const tiersRes = await request(app).get("/api/rules/tiers").set("Cookie", authCookie());
    expect(tiersRes.body.find((t: { id: string }) => t.id === tierId)).toBeUndefined();
  });
});
