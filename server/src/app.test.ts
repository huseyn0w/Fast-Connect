import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

describe("createApp", () => {
  const app = createApp();

  it("serves a healthy /health payload", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.uptime).toBe("number");
  });

  it("hides the x-powered-by header", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });

  it("applies helmet security headers", async () => {
    const res = await request(app).get("/health");
    // Helmet sets these by default.
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-dns-prefetch-control"]).toBeDefined();
  });

  it("404s unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });
});
