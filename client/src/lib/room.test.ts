import { describe, expect, it } from "vitest";
import { generateRoomId, normaliseRoomId } from "./room";

describe("generateRoomId", () => {
  it("produces an adjective-noun-suffix slug", () => {
    expect(generateRoomId()).toMatch(/^[a-z]+-[a-z]+-[a-z0-9]{4}$/);
  });

  it("is effectively unique across calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateRoomId()));
    expect(ids.size).toBeGreaterThan(45);
  });
});

describe("normaliseRoomId", () => {
  it("lowercases and hyphenates whitespace", () => {
    expect(normaliseRoomId("  Team Standup  ")).toBe("team-standup");
  });

  it("strips disallowed characters", () => {
    expect(normaliseRoomId("Hello!@# World 2024")).toBe("hello-world-2024");
  });

  it("caps length at 64 characters", () => {
    expect(normaliseRoomId("a".repeat(100))).toHaveLength(64);
  });

  it("returns null for input that is empty after cleaning", () => {
    expect(normaliseRoomId("   ")).toBeNull();
    expect(normaliseRoomId("!@#$")).toBeNull();
  });
});
