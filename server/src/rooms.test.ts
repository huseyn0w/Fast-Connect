import { describe, expect, it } from "vitest";
import { RoomRegistry } from "./rooms.js";

const peer = (peerId: string, userName = peerId) => ({ peerId, userName });

describe("RoomRegistry", () => {
  it("returns an empty list for the first peer in a room", () => {
    const rooms = new RoomRegistry();
    expect(rooms.join("alpha", peer("a"))).toEqual([]);
  });

  it("returns the peers that were already present on join", () => {
    const rooms = new RoomRegistry();
    rooms.join("alpha", peer("a", "Ann"));
    rooms.join("alpha", peer("b", "Bob"));

    const existing = rooms.join("alpha", peer("c", "Cara"));

    expect(existing).toEqual([
      { peerId: "a", userName: "Ann" },
      { peerId: "b", userName: "Bob" },
    ]);
  });

  it("dedups a re-join with the same peerId (excludes self from existing)", () => {
    const rooms = new RoomRegistry();
    rooms.join("alpha", peer("a", "Ann"));

    const existing = rooms.join("alpha", peer("a", "Ann renamed"));

    expect(existing).toEqual([]);
    // No duplicate entry; the latest info wins.
    expect(rooms.peers("alpha")).toEqual([{ peerId: "a", userName: "Ann renamed" }]);
  });

  it("isolates peers per room", () => {
    const rooms = new RoomRegistry();
    rooms.join("alpha", peer("a"));
    rooms.join("beta", peer("b"));

    expect(rooms.peers("alpha")).toEqual([peer("a")]);
    expect(rooms.peers("beta")).toEqual([peer("b")]);
  });

  it("removes a peer on leave but keeps the room while others remain", () => {
    const rooms = new RoomRegistry();
    rooms.join("alpha", peer("a"));
    rooms.join("alpha", peer("b"));

    rooms.leave("alpha", "a");

    expect(rooms.peers("alpha")).toEqual([peer("b")]);
    expect(rooms.roomCount).toBe(1);
  });

  it("deletes the room once the last peer leaves", () => {
    const rooms = new RoomRegistry();
    rooms.join("alpha", peer("a"));

    rooms.leave("alpha", "a");

    expect(rooms.peers("alpha")).toEqual([]);
    expect(rooms.roomCount).toBe(0);
  });

  it("ignores leave for unknown rooms / peers", () => {
    const rooms = new RoomRegistry();
    expect(() => rooms.leave("nope", "ghost")).not.toThrow();
    rooms.join("alpha", peer("a"));
    rooms.leave("alpha", "ghost");
    expect(rooms.peers("alpha")).toEqual([peer("a")]);
  });

  it("tracks roomCount across multiple rooms", () => {
    const rooms = new RoomRegistry();
    expect(rooms.roomCount).toBe(0);
    rooms.join("alpha", peer("a"));
    rooms.join("beta", peer("b"));
    expect(rooms.roomCount).toBe(2);
  });

  it("returns an empty list of peers for an unknown room", () => {
    const rooms = new RoomRegistry();
    expect(rooms.peers("missing")).toEqual([]);
  });
});
