import type { ChatMessage } from "../lib/signaling/events";

export interface Participant {
  peerId: string;
  userName: string;
  stream: MediaStream;
}

export interface ScreenShare {
  peerId: string;
  userName: string;
  stream: MediaStream;
  /** True when this is the local user's own screen. */
  isLocal: boolean;
}

export type ConnectionStatus = "connecting" | "connected" | "error";

export interface Conference {
  status: ConnectionStatus;
  participants: Participant[];
  messages: ChatMessage[];
  screenShare: ScreenShare | null;
  isSharingScreen: boolean;
  sendMessage: (text: string) => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
}

/** Metadata attached to PeerJS media calls to distinguish stream kinds. */
export interface CallMetadata {
  userName: string;
  kind: "camera" | "screen";
}
