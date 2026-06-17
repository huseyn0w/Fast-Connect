import type { PeerInfo } from "./events.js";

/**
 * In-memory registry of rooms and their members.
 *
 * State is intentionally ephemeral: rooms exist only while at least one peer is
 * connected, which is all a signaling layer needs. Swapping this for Redis later
 * only requires reimplementing this class — nothing else depends on the storage.
 */
export class RoomRegistry {
  private readonly rooms = new Map<string, Map<string, PeerInfo>>();

  /** Adds a peer to a room and returns the peers that were already present. */
  join(roomId: string, peer: PeerInfo): PeerInfo[] {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new Map();
      this.rooms.set(roomId, room);
    }
    const existing = [...room.values()].filter((p) => p.peerId !== peer.peerId);
    room.set(peer.peerId, peer);
    return existing;
  }

  /** Removes a peer; drops the room entirely once empty. */
  leave(roomId: string, peerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.delete(peerId);
    if (room.size === 0) this.rooms.delete(roomId);
  }

  peers(roomId: string): PeerInfo[] {
    return [...(this.rooms.get(roomId)?.values() ?? [])];
  }

  get roomCount(): number {
    return this.rooms.size;
  }
}
