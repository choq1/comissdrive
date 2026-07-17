import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

const app = createApp();

const newEmployee = {
  code: "E999",
  name: "Test Employee",
  role: "QA",
  department: "Sales",
  baseSalary: 1000,
  tier: "Silver",
  status: "active",
};

describe("Employees routes", () => {
  it("lists existing employees", async () => {
    const res = await request(app).get("/api/employees").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("returns 404 for an unknown employee", async () => {
    const res = await request(app).get("/api/employees/does-not-exist").set("Cookie", authCookie());
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid payload", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Cookie", authCookie())
      .send({ name: "Missing fields" });
    expect(res.status).toBe(400);
  });

  it("returns 401 without a session", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(401);
  });

  it("returns 403 for a manager trying to create an employee", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Cookie", authCookie("manager"))
      .send(newEmployee);
    expect(res.status).toBe(403);
  });

  it("creates, updates and deletes an employee", async () => {
    const createRes = await request(app).post("/api/employees").set("Cookie", authCookie()).send(newEmployee);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/employees/${id}`)
      .set("Cookie", authCookie())
      .send({ baseSalary: 1500 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.baseSalary).toBe(1500);

    const deleteRes = await request(app).delete(`/api/employees/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/employees/${id}`).set("Cookie", authCookie());
    expect(getRes.status).toBe(404);
  });
});
