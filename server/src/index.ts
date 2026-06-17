import { createServer } from "node:http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
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
const peerServer = ExpressPeerServer(httpServer, { path: "/" });
app.use(config.peerPath, peerServer);

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
