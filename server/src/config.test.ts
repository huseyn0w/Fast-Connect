import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `readPort` / `readOrigins` are intentionally NOT exported from config.ts, so we
 * exercise their behaviour through the observable `config` object. Because the
 * module computes `config` at import time, each case stubs env vars, resets the
 * module registry, and re-imports a fresh copy.
 */
async function loadConfig() {
  vi.resetModules();
  const mod = await import("./config.js");
  return mod.config;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("config", () => {
  it("falls back to defaults when nothing is set", async () => {
    vi.stubEnv("PORT", "");
    vi.stubEnv("CORS_ORIGINS", "");
    vi.stubEnv("PEER_PATH", "");
    vi.stubEnv("NODE_ENV", "");

    const config = await loadConfig();

    expect(config.port).toBe(5000);
    expect(config.corsOrigins).toBe("*");
    expect(config.peerPath).toBe("/peerjs");
    expect(config.nodeEnv).toBe("development");
    expect(config.isProduction).toBe(false);
  });

  it("parses a valid PORT", async () => {
    vi.stubEnv("PORT", "8080");
    const config = await loadConfig();
    expect(config.port).toBe(8080);
  });

  it("throws on a non-numeric PORT", async () => {
    vi.stubEnv("PORT", "abc");
    await expect(loadConfig()).rejects.toThrow(/Invalid PORT/);
  });

  it("throws on an out-of-range PORT", async () => {
    vi.stubEnv("PORT", "70000");
    await expect(loadConfig()).rejects.toThrow(/Invalid PORT/);
  });

  it("throws on a non-positive PORT", async () => {
    vi.stubEnv("PORT", "0");
    await expect(loadConfig()).rejects.toThrow(/Invalid PORT/);
  });

  it("treats '*' CORS_ORIGINS as the wildcard", async () => {
    vi.stubEnv("CORS_ORIGINS", "*");
    const config = await loadConfig();
    expect(config.corsOrigins).toBe("*");
  });

  it("splits, trims and filters a CORS_ORIGINS list", async () => {
    vi.stubEnv("CORS_ORIGINS", " https://a.com , https://b.com ,, ");
    const config = await loadConfig();
    expect(config.corsOrigins).toEqual(["https://a.com", "https://b.com"]);
  });

  it("respects a custom PEER_PATH and production flag", async () => {
    vi.stubEnv("PEER_PATH", "/rtc");
    vi.stubEnv("NODE_ENV", "production");
    const config = await loadConfig();
    expect(config.peerPath).toBe("/rtc");
    expect(config.nodeEnv).toBe("production");
    expect(config.isProduction).toBe(true);
  });
});
