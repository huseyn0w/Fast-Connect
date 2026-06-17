import type { PointerEvent } from "react";
import { Microphone, MicrophoneSlash, VideoCamera } from "@phosphor-icons/react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface Tile {
  name: string;
  /** Full-tile mesh-gradient classes (camera-off background). */
  fill: string;
  /** Soft light-blob colour for depth. */
  glow: string;
  speaking?: boolean;
  muted?: boolean;
}

const TILES: Tile[] = [
  { name: "Mara", fill: "from-aurora/30 via-aurora-soft/12 to-transparent", glow: "bg-aurora/40", speaking: true },
  { name: "Teo", fill: "from-cyan-400/25 via-aurora-glow/10 to-transparent", glow: "bg-cyan-400/30" },
  { name: "Yuki", fill: "from-indigo-400/25 via-aurora/10 to-transparent", glow: "bg-indigo-400/35" },
  { name: "Ravi", fill: "from-emerald-400/22 via-cyan-400/10 to-transparent", glow: "bg-emerald-400/28", muted: true },
];

/** Equaliser bars that pulse while a participant is speaking. */
function Waveform({ animate }: { animate: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[2.5px]">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="w-[3px] origin-bottom rounded-full bg-aurora-soft"
          style={{ height: "100%", scaleY: 0.4 }}
          animate={animate ? { scaleY: [0.35, 1, 0.5, 0.85, 0.35] } : undefined}
          transition={
            animate ? { duration: 0.9 + i * 0.12, repeat: Infinity, ease: "easeInOut" } : undefined
          }
        />
      ))}
    </span>
  );
}

/**
 * A genuine miniature of the room UI used as the hero visual — real components,
 * not a screenshot. Each tile is a camera-off state: a soft per-person mesh
 * gradient with a name and live audio indicator (no avatar circles). Tilts
 * toward the pointer with spring physics and floats gently; both collapse
 * under reduced-motion.
 */
export function CallPreview() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 12 });
  const sy = useSpring(py, { stiffness: 120, damping: 12 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [9, -9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-9, 9]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div className="[perspective:1400px]" onPointerMove={onMove} onPointerLeave={reset}>
      <div className={reduce ? "" : "animate-float"}>
        <motion.div
          style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-float backdrop-blur-xl sm:p-5"
        >
          {/* top edge highlight */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
            {TILES.map((tile, i) => (
              <motion.div
                key={tile.name}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={`relative aspect-video overflow-hidden rounded-2xl border bg-ink-card ${
                  tile.speaking ? "border-aurora/60 shadow-glow" : "border-white/10"
                }`}
              >
                {/* per-person mesh gradient fill */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tile.fill}`} />
                {/* soft light source for depth */}
                <div className={`absolute -left-5 -top-7 h-24 w-24 rounded-full ${tile.glow} blur-2xl`} />
                {/* legibility gradient under the label */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/75 to-transparent" />

                {tile.speaking && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-aurora/40 animate-shimmer" />
                )}

                <span className="absolute bottom-2 left-2.5 text-sm font-medium text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                  {tile.name}
                </span>

                <span className="absolute bottom-2 right-2 grid h-6 min-w-6 place-items-center rounded-md bg-ink/55 px-1 backdrop-blur-sm">
                  {tile.speaking ? (
                    <Waveform animate={!reduce} />
                  ) : tile.muted ? (
                    <MicrophoneSlash size={14} weight="fill" className="text-rose-300/90" />
                  ) : (
                    <Microphone size={14} weight="fill" className="text-slate-300/70" />
                  )}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-slate-200">
              <Microphone size={20} weight="fill" />
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.06] text-slate-200">
              <VideoCamera size={20} weight="fill" />
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-500/90 text-white shadow-[0_8px_24px_-6px_rgba(244,63,94,0.6)]">
              <span className="h-2 w-5 rounded-full bg-white" />
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
