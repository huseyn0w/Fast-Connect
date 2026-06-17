import { createServer, type Server as HttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { registerSignaling } from "./signaling.js";

/** Spins up a real Socket.IO server on an ephemeral port for each test. */
let httpServer: HttpServer;
let io: Server;
let url: string;
const clients: ClientSocket[] = [];

const connect = (): ClientSocket => {
  const socket = ioClient(url, { transports: ["websocket"], forceNew: true });
  clients.push(socket);
  return socket;
};

const once = <T>(socket: ClientSocket, event: string) =>
  new Promise<T>((resolve) => socket.once(event, resolve as (v: T) => void));

beforeEach(async () => {
  httpServer = createServer();
  io = new Server(httpServer);
  registerSignaling(io);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
});

afterEach(async () => {
  clients.forEach((c) => c.disconnect());
  clients.length = 0;
  io.close();
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
});

describe("signaling", () => {
  it("tells the first joiner the room is empty", async () => {
    const a = connect();
    const peers = await new Promise<unknown[]>((resolve) => {
      a.on("connect", () => a.emit("room:join", { roomId: "r1", peerId: "pa", userName: "Ann" }));
      a.on("room:peers", resolve);
    });
    expect(peers).toEqual([]);
  });

  it("notifies existing members and hands the joiner the roster", async () => {
    const a = connect();
    await once(a, "connect");
    a.emit("room:join", { roomId: "r1", peerId: "pa", userName: "Ann" });
    await once(a, "room:peers");

    const joined = once<{ peerId: string; userName: string }>(a, "peer:joined");

    const b = connect();
    await once(b, "connect");
    const bPeers = once<Array<{ peerId: string }>>(b, "room:peers");
    b.emit("room:join", { roomId: "r1", peerId: "pb", userName: "Bob" });

    expect(await joined).toEqual({ peerId: "pb", userName: "Bob" });
    expect(await bPeers).toEqual([{ peerId: "pa", userName: "Ann" }]);
  });

  it("broadcasts chat messages to the room with a server timestamp", async () => {
    const a = connect();
    await once(a, "connect");
    a.emit("room:join", { roomId: "r1", peerId: "pa", userName: "Ann" });
    await once(a, "room:peers");

    const received = once<{ sender: string; text: string; sentAt: number }>(a, "chat:message");
    a.emit("chat:send", { text: "  hello  " });

    const msg = await received;
    expect(msg.sender).toBe("Ann");
    expect(msg.text).toBe("hello"); // trimmed
    expect(typeof msg.sentAt).toBe("number");
  });

  it("ignores empty chat messages", async () => {
    const a = connect();
    await once(a, "connect");
    a.emit("room:join", { roomId: "r1", peerId: "pa", userName: "Ann" });
    await once(a, "room:peers");

    let got = false;
    a.on("chat:message", () => (got = true));
    a.emit("chat:send", { text: "   " });
    await new Promise((r) => setTimeout(r, 100));
    expect(got).toBe(false);
  });

  it("emits peer:left when a member disconnects", async () => {
    const a = connect();
    await once(a, "connect");
    a.emit("room:join", { roomId: "r1", peerId: "pa", userName: "Ann" });
    await once(a, "room:peers");

    const b = connect();
    await once(b, "connect");
    b.emit("room:join", { roomId: "r1", peerId: "pb", userName: "Bob" });
    await once(a, "peer:joined");

    const left = once<{ peerId: string }>(a, "peer:left");
    b.disconnect();
    expect(await left).toEqual({ peerId: "pb" });
  });
});
