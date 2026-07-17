import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

const app = createApp();

const newUser = {
  name: "Test User",
  email: "test.user@commissioning.local",
  role: "manager",
  password: "test1234",
};

describe("Users routes", () => {
  it("lists existing users", async () => {
    const res = await request(app).get("/api/users").set("Cookie", authCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].passwordHash).toBeUndefined();
  });

  it("returns 404 for an unknown user", async () => {
    const res = await request(app).get("/api/users/does-not-exist").set("Cookie", authCookie());
    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid payload", async () => {
    const res = await request(app)
      .post("/api/users")
      .set("Cookie", authCookie())
      .send({ name: "Missing fields" });
    expect(res.status).toBe(400);
  });

  it("returns 403 for a manager trying to list users", async () => {
    const res = await request(app).get("/api/users").set("Cookie", authCookie("manager"));
    expect(res.status).toBe(403);
  });

  it("creates, updates and deletes a user", async () => {
    const createRes = await request(app).post("/api/users").set("Cookie", authCookie()).send(newUser);
    expect(createRes.status).toBe(201);
    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.passwordHash).toBeUndefined();
    const id = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/users/${id}`)
      .set("Cookie", authCookie())
      .send({ role: "admin" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.role).toBe("admin");

    const deleteRes = await request(app).delete(`/api/users/${id}`).set("Cookie", authCookie());
    expect(deleteRes.status).toBe(204);

    const getRes = await request(app).get(`/api/users/${id}`).set("Cookie", authCookie());
    expect(getRes.status).toBe(404);
  });
});
