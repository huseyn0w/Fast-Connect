import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaConnection } from "peerjs";
import { v4 as uuidv4 } from "uuid";
import { createSocket, type AppSocket } from "../lib/signaling/createSocket";
import { createPeer } from "../lib/peer/createPeer";
import type { ChatMessage, PeerInfo } from "../lib/signaling/events";
import type { CallMetadata, Conference, ConnectionStatus, Participant, ScreenShare } from "./types";

interface Options {
  roomId: string;
  userName: string;
  /** Local camera/mic stream; the conference only connects once this is ready. */
  localStream: MediaStream | null;
}

/**
 * Orchestrates a full-mesh WebRTC conference:
 *  - Socket.IO carries room membership + chat.
 *  - PeerJS carries media; one call per pair exchanges both cameras,
 *    a separate tagged call carries a screen share.
 *
 * All peer/connection bookkeeping lives in refs so React re-renders only when
 * the rendered collections (participants, messages, screen share) actually change.
 */
export function useConference({ roomId, userName, localStream }: Options): Conference {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [screenShare, setScreenShare] = useState<ScreenShare | null>(null);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  const socketRef = useRef<AppSocket | null>(null);
  const peerIdRef = useRef<string>(uuidv4());
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const userNameRef = useRef(userName);
  /** Active media connections grouped by remote peer id, for teardown. */
  const connectionsRef = useRef<Map<string, MediaConnection[]>>(new Map());
  /** Bound inside the connection effect; calls one peer with the current screen stream. */
  const screenCallFactoryRef = useRef<((peerId: string) => MediaConnection | null) | null>(null);

  localStreamRef.current = localStream;
  userNameRef.current = userName;

  const upsertParticipant = useCallback((peerId: string, name: string, stream: MediaStream) => {
    setParticipants((prev) => {
      const existing = prev.find((p) => p.peerId === peerId);
      if (existing?.stream.id === stream.id) return prev;
      const without = prev.filter((p) => p.peerId !== peerId);
      return [...without, { peerId, userName: name, stream }];
    });
  }, []);

  const removeParticipant = useCallback((peerId: string) => {
    setParticipants((prev) => prev.filter((p) => p.peerId !== peerId));
    setScreenShare((prev) => (prev && !prev.isLocal && prev.peerId === peerId ? null : prev));
    connectionsRef.current.get(peerId)?.forEach((conn) => conn.close());
    connectionsRef.current.delete(peerId);
  }, []);

  const trackConnection = useCallback((peerId: string, conn: MediaConnection) => {
    const list = connectionsRef.current.get(peerId) ?? [];
    list.push(conn);
    connectionsRef.current.set(peerId, list);
  }, []);

  useEffect(() => {
    if (!localStream) return;

    const peer = createPeer(peerIdRef.current);
    const socket = createSocket();
    socketRef.current = socket;
    // Stable Map for this connection's lifetime; captured for use in cleanup.
    const connections = connectionsRef.current;

    /** Wires the stream/close handlers for a single media connection. */
    const handleConnection = (conn: MediaConnection, fallbackName: string) => {
      const meta = (conn.metadata ?? {}) as Partial<CallMetadata>;
      const name = meta.userName ?? fallbackName;
      trackConnection(conn.peer, conn);

      conn.on("stream", (remoteStream) => {
        if (meta.kind === "screen") {
          setScreenShare({ peerId: conn.peer, userName: name, stream: remoteStream, isLocal: false });
        } else {
          upsertParticipant(conn.peer, name, remoteStream);
        }
      });
      conn.on("close", () => {
        if (meta.kind === "screen") {
          setScreenShare((prev) => (prev && prev.peerId === conn.peer ? null : prev));
        }
      });
      conn.on("error", () => removeParticipant(conn.peer));
    };

    // Someone calls us: answer camera calls with our camera; screen calls need no return media.
    peer.on("call", (call) => {
      const meta = (call.metadata ?? {}) as Partial<CallMetadata>;
      call.answer(meta.kind === "screen" ? undefined : (localStreamRef.current ?? undefined));
      handleConnection(call, "Guest");
    });

    // We initiate camera calls to peers already in the room.
    const callPeerCamera = ({ peerId, userName: name }: PeerInfo) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const call = peer.call(peerId, stream, {
        metadata: { userName: userNameRef.current, kind: "camera" } satisfies CallMetadata,
      });
      handleConnection(call, name);
    };

    const joinRoom = () => {
      if (peer.id && socket.connected) {
        socket.emit("room:join", { roomId, peerId: peer.id, userName: userNameRef.current });
      }
    };

    peer.on("open", () => {
      setStatus("connected");
      joinRoom();
    });
    peer.on("error", () => setStatus("error"));
    socket.on("connect", joinRoom);

    socket.on("room:peers", (peers) => peers.forEach(callPeerCamera));

    socket.on("peer:joined", (peer) => {
      // The newcomer will call us for camera. If we're sharing, push our screen to them.
      const screen = screenStreamRef.current;
      if (screen) {
        const call = createScreenCall(peer.peerId);
        if (call) handleConnection(call, peer.userName);
      }
    });

    socket.on("peer:left", ({ peerId }) => removeParticipant(peerId));

    socket.on("chat:message", (message) => setMessages((prev) => [...prev, message]));

    // Calls one peer with the current screen stream. Returns the connection or null.
    function createScreenCall(peerId: string): MediaConnection | null {
      const screen = screenStreamRef.current;
      if (!screen) return null;
      return peer.call(peerId, screen, {
        metadata: { userName: userNameRef.current, kind: "screen" } satisfies CallMetadata,
      });
    }
    // Expose to the share callbacks via ref-bound closure.
    screenCallFactoryRef.current = createScreenCall;

    return () => {
      socket.emit("room:leave");
      socket.disconnect();
      connections.forEach((list) => list.forEach((conn) => conn.close()));
      connections.clear();
      peer.destroy();
      socketRef.current = null;
      screenCallFactoryRef.current = null;
    };
    // Connect exactly once per room, after local media is available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, roomId]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (trimmed) socketRef.current?.emit("chat:send", { text: trimmed });
  }, []);

  const stopScreenShare = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenStreamRef.current = null;
    setIsSharingScreen(false);
    setScreenShare((prev) => (prev?.isLocal ? null : prev));
  }, []);

  const startScreenShare = useCallback(async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screen;
      setIsSharingScreen(true);
      setScreenShare({ peerId: peerIdRef.current, userName: userNameRef.current, stream: screen, isLocal: true });
      // Push the screen to everyone currently in the room.
      participants.forEach((p) => screenCallFactoryRef.current?.(p.peerId));
      // Stop sharing when the user ends it from the browser's native control.
      screen.getVideoTracks()[0]?.addEventListener("ended", () => stopScreenShare());
    } catch {
      /* user cancelled the picker — nothing to do */
    }
  }, [participants, stopScreenShare]);

  return {
    status,
    participants,
    messages,
    screenShare,
    isSharingScreen,
    sendMessage,
    startScreenShare,
    stopScreenShare,
  };
}
