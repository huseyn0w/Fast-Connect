import { useEffect, useRef } from "react";
import { Monitor } from "@phosphor-icons/react";
import type { ScreenShare } from "../../hooks/types";

/** Spotlight area for the currently shared screen. */
export function ScreenStage({ share }: { share: ScreenShare }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el && el.srcObject !== share.stream) {
      el.srcObject = share.stream;
    }
  }, [share.stream]);

  return (
    <div className="relative flex-1 overflow-hidden rounded-2xl border border-aurora/30 bg-black shadow-glow">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-contain" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-ink/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
        <Monitor size={14} weight="fill" />
        {share.isLocal ? "You are presenting" : `${share.userName} is presenting`}
      </span>
    </div>
  );
}
