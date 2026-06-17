/**
 * Signaling contract shared (by convention) between client and server.
 *
 * The client keeps a mirror of these types in `client/src/lib/signaling/events.ts`.
 * Keep both files in sync — they are intentionally duplicated to avoid coupling
 * the Vite browser build to the Node server build.
 */

export interface PeerInfo {
  peerId: string;
  userName: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  /** Epoch milliseconds, stamped by the server. */
  sentAt: number;
}

/** Events the client emits to the server. */
export interface ClientToServerEvents {
  "room:join": (payload: { roomId: string; peerId: string; userName: string }) => void;
  "room:leave": () => void;
  "chat:send": (payload: { text: string }) => void;
}

/** Events the server emits to the client. */
export interface ServerToClientEvents {
  /** Sent only to the joining socket: who is already in the room. */
  "room:peers": (peers: PeerInfo[]) => void;
  /** Broadcast to the room when a new peer joins. */
  "peer:joined": (peer: PeerInfo) => void;
  /** Broadcast to the room when a peer leaves. */
  "peer:left": (payload: { peerId: string }) => void;
  /** A chat message delivered to the room. */
  "chat:message": (message: ChatMessage) => void;
}

/** Per-socket state stored server-side. */
export interface SocketData {
  roomId?: string;
  peerId?: string;
  userName?: string;
}
