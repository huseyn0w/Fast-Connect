import Peer, { type PeerOptions } from "peerjs";
import { config } from "../../config";

/**
 * Derives PeerJS connection options from the configured server URL so media
 * negotiation goes through our self-hosted broker instead of the public cloud.
 */
export function peerOptionsFromConfig(
  serverUrl = config.serverUrl,
  peerPath = config.peerPath,
): PeerOptions {
  const url = new URL(serverUrl || window.location.origin);
  const secure = url.protocol === "https:";
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : secure ? 443 : 80,
    path: peerPath,
    secure,
  };
}

/** Creates a PeerJS peer with the given id, bound to our broker. */
export function createPeer(peerId: string): Peer {
  return new Peer(peerId, peerOptionsFromConfig());
}
