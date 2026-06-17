import { useCallback, useEffect, useRef, useState } from "react";

export interface LocalMedia {
  stream: MediaStream | null;
  error: string | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

/**
 * Acquires the local camera/microphone once and exposes mute toggles.
 * Uses the modern `mediaDevices.getUserMedia` API and tears the stream down on unmount.
 */
export function useLocalMedia(constraints: MediaStreamConstraints = { audio: true, video: true }): LocalMedia {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Join muted by default; the user opts into being heard.
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  // Keep constraints stable across renders without forcing callers to memoise.
  const constraintsRef = useRef(constraints);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      .getUserMedia(constraintsRef.current)
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        // Start muted: silence the mic track but keep it in the stream so
        // unmuting later (and WebRTC negotiation) needs no renegotiation.
        mediaStream.getAudioTracks().forEach((track) => (track.enabled = false));
        streamRef.current = mediaStream;
        setStream(mediaStream);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not access camera or microphone");
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleAudio = useCallback(() => {
    const tracks = streamRef.current?.getAudioTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0]!.enabled;
    tracks.forEach((track) => (track.enabled = next));
    setAudioEnabled(next);
  }, []);

  const toggleVideo = useCallback(() => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    if (tracks.length === 0) return;
    const next = !tracks[0]!.enabled;
    tracks.forEach((track) => (track.enabled = next));
    setVideoEnabled(next);
  }, []);

  return { stream, error, audioEnabled, videoEnabled, toggleAudio, toggleVideo };
}
