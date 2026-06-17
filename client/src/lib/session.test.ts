import { afterEach, describe, expect, it } from "vitest";
import { session } from "./session";

afterEach(() => sessionStorage.clear());

describe("session", () => {
  it("returns an empty string when no name is stored", () => {
    expect(session.getName()).toBe("");
  });

  it("round-trips a stored name", () => {
    session.setName("Mara Lindqvist");
    expect(session.getName()).toBe("Mara Lindqvist");
  });
});
