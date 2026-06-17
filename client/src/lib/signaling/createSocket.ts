import { io, type Socket } from "socket.io-client";
import { config } from "../../config";
import type { ClientToServerEvents, ServerToClientEvents } from "./events";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Creates a typed Socket.IO client pointed at the signaling server. */
export function createSocket(): AppSocket {
  return io(config.serverUrl, {
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
}
