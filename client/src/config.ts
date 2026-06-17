/** Browser-side runtime configuration, read from Vite env vars. */
export const config = {
  /** Signaling server origin. Empty string => same origin as the app. */
  serverUrl: import.meta.env.VITE_SERVER_URL ?? "",
  /** PeerJS broker path; must match the server's PEER_PATH. */
  peerPath: import.meta.env.VITE_PEER_PATH ?? "/peerjs",
} as const;
