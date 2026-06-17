import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import { WebSocketServer } from "ws";
import { config } from "./config.js";
import { createApp } from "./app.js";
import { registerSignaling } from "./signaling.js";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./events.js";

const app = createApp();
const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
>(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
  },
});

registerSignaling(io);

// Self-hosted PeerJS broker so media negotiation never touches the public cloud.
//
// PeerJS and Socket.IO both want to handle WebSocket upgrades on this one HTTP
// server. PeerJS's default `ws` server aborts every upgrade whose path it
// doesn't own with a 400 — including Socket.IO's — which corrupts the frames
// Socket.IO already wrote (clients see "RSV1 must be clear" and never connect,
// breaking room membership and chat). So we hand PeerJS a detached `noServer`
// WebSocket server and route upgrades by path ourselves: PeerJS only ever sees
// its own broker path, and Socket.IO keeps its own upgrade handler untouched.
let peerWss: WebSocketServer | undefined;
const peerServer = ExpressPeerServer(httpServer, {
  path: "/",
  createWebSocketServer: () => {
    peerWss = new WebSocketServer({ noServer: true });
    return peerWss;
  },
});
app.use(config.peerPath, peerServer);

httpServer.on("upgrade", (req, socket, head) => {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (peerWss && pathname.startsWith(config.peerPath)) {
    peerWss.handleUpgrade(req, socket, head, (ws) => peerWss!.emit("connection", ws, req));
  }
  // Anything else (e.g. /socket.io/) is left for Socket.IO's own upgrade handler.
});

httpServer.listen(config.port, () => {
  console.log(
    `[fast-connect] signaling listening on :${config.port} ` +
      `(env=${config.nodeEnv}, peer=${config.peerPath})`,
  );
});

const shutdown = (signal: string) => {
  console.log(`[fast-connect] ${signal} received, shutting down`);
  io.close();
  httpServer.close(() => process.exit(0));
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
