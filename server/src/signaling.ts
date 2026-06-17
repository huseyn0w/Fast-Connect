import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./events.js";
import { RoomRegistry } from "./rooms.js";

type IOServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

const MAX_FIELD_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 2000;

/** Trims, length-caps and rejects empty user input. Returns null when invalid. */
function sanitize(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().slice(0, maxLength);
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Wires Socket.IO connection handling to the room registry.
 * Exported as a function so tests can attach it to an isolated server.
 */
export function registerSignaling(io: IOServer, rooms = new RoomRegistry()): RoomRegistry {
  io.on("connection", (socket: IOSocket) => {
    socket.on("room:join", ({ roomId, peerId, userName }) => {
      const room = sanitize(roomId, MAX_FIELD_LENGTH);
      const peer = sanitize(peerId, MAX_FIELD_LENGTH);
      const name = sanitize(userName, MAX_FIELD_LENGTH) ?? "Guest";
      if (!room || !peer) return;

      socket.data.roomId = room;
      socket.data.peerId = peer;
      socket.data.userName = name;
      void socket.join(room);

      const existingPeers = rooms.join(room, { peerId: peer, userName: name });
      // Tell the joining socket who is already here so it can place the calls.
      socket.emit("room:peers", existingPeers);
      // Tell everyone else a new peer arrived.
      socket.to(room).emit("peer:joined", { peerId: peer, userName: name });
    });

    socket.on("chat:send", ({ text }) => {
      const { roomId, userName } = socket.data;
      const body = sanitize(text, MAX_MESSAGE_LENGTH);
      if (!roomId || !body) return;
      io.to(roomId).emit("chat:message", {
        sender: userName ?? "Guest",
        text: body,
        sentAt: Date.now(),
      });
    });

    const departRoom = () => {
      const { roomId, peerId } = socket.data;
      if (!roomId || !peerId) return;
      rooms.leave(roomId, peerId);
      socket.to(roomId).emit("peer:left", { peerId });
      void socket.leave(roomId);
      socket.data.roomId = undefined;
      socket.data.peerId = undefined;
    };

    socket.on("room:leave", departRoom);
    socket.on("disconnect", departRoom);
  });

  return rooms;
}
