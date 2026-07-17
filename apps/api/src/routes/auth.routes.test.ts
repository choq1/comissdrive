import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { authCookie } from "../test-utils/authCookie";

const app = createApp();

const TEST_EMAIL = "auth.test.user@commissioning.local";
const TEST_PASSWORD = "test1234";
let testUserId: string;

describe("Auth routes", () => {
  beforeAll(async () => {
    const res = await request(app).post("/api/users").set("Cookie", authCookie()).send({
      name: "Auth Test User",
      email: TEST_EMAIL,
      role: "manager",
      password: TEST_PASSWORD,
    });
    testUserId = res.body.id;
  });

  afterAll(async () => {
    if (testUserId) await request(app).delete(`/api/users/${testUserId}`).set("Cookie", authCookie());
  });

  it("logs in with correct credentials, setting a session cookie", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^token=/);
  });

  it("returns 401 for wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: TEST_EMAIL, password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("returns 401 for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@commissioning.local", password: "whatever" });
    expect(res.status).toBe(401);
  });

  it("/me returns 401 without a session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("/me returns the current user with a valid session", async () => {
    const res = await request(app).get("/api/auth/me").set("Cookie", authCookie("manager", testUserId));
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_EMAIL);
  });

  it("a protected route rejects requests without a session", async () => {
    const res = await request(app).get("/api/employees");
    expect(res.status).toBe(401);
  });

  it("an admin-only route rejects a manager session", async () => {
    const res = await request(app).get("/api/users").set("Cookie", authCookie("manager"));
    expect(res.status).toBe(403);
  });
});
