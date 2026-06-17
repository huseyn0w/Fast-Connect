/**
 * Mirror of the server's signaling contract (`server/src/events.ts`).
 * Kept in sync by convention — see the note in the server file.
 */

export interface PeerInfo {
  peerId: string;
  userName: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  sentAt: number;
}

export interface ClientToServerEvents {
  "room:join": (payload: { roomId: string; peerId: string; userName: string }) => void;
  "room:leave": () => void;
  "chat:send": (payload: { text: string }) => void;
}

export interface ServerToClientEvents {
  "room:peers": (peers: PeerInfo[]) => void;
  "peer:joined": (peer: PeerInfo) => void;
  "peer:left": (payload: { peerId: string }) => void;
  "chat:message": (message: ChatMessage) => void;
}
