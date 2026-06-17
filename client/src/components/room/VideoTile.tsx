import { useEffect, useRef } from "react";
import { MicrophoneSlash } from "@phosphor-icons/react";

interface VideoTileProps {
  stream: MediaStream;
  name: string;
  /** Mute playback (always true for your own tile to avoid echo). */
  muted?: boolean;
  isLocal?: boolean;
  audioOff?: boolean;
}

/** Renders a single participant's media stream with a name badge. */
export function VideoTile({ stream, name, muted = false, isLocal = false, audioOff = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el && el.srcObject !== stream) {
      el.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-ink-card shadow-card">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${isLocal ? "[transform:rotateY(180deg)]" : ""}`}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-ink/80 to-transparent p-3">
        <span className="rounded-lg bg-ink/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {name}
          {isLocal && <span className="text-slate-400"> (you)</span>}
        </span>
        {audioOff && (
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-rose-500/90 text-white">
            <MicrophoneSlash size={14} weight="fill" />
          </span>
        )}
      </div>
    </div>
  );
}
