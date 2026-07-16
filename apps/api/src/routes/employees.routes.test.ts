import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

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
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("returns 404 for an unknown employee", async () => {
    const res = await request(app).get("/api/employees/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid payload", async () => {
    const res = await request(app).post("/api/employees").send({ name: "Missing fields" });
    expect(res.status).toBe(400);
  });

  it("creates, updates and deletes an employee", async () => {
    const createRes = await request(app).post("/api/employees").send(newEmployee);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    const id = createRes.body.id;

    const updateRes = await request(app).put(`/api/employees/${id}`).send({ baseSalary: 1500 });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.baseSalary).toBe(1500);

    const deleteRes = await request(app).delete(`/api/employees/${id}`);
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/employees/${id}`);
    expect(getRes.status).toBe(404);
  });
});
