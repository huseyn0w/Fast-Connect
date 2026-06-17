import { describe, expect, it } from "vitest";
import { peerOptionsFromConfig } from "./createPeer";

describe("peerOptionsFromConfig", () => {
  it("derives host/port/path from an http URL", () => {
    expect(peerOptionsFromConfig("http://localhost:5000", "/peerjs")).toEqual({
      host: "localhost",
      port: 5000,
      path: "/peerjs",
      secure: false,
    });
  });

  it("marks https URLs secure and defaults the port to 443", () => {
    expect(peerOptionsFromConfig("https://calls.example.com", "/rtc")).toEqual({
      host: "calls.example.com",
      port: 443,
      path: "/rtc",
      secure: true,
    });
  });

  it("falls back to the current origin when the URL is empty", () => {
    const opts = peerOptionsFromConfig("", "/peerjs");
    expect(opts.host).toBe(window.location.hostname);
    expect(opts.secure).toBe(window.location.protocol === "https:");
  });
});
