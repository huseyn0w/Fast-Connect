import type { PointerEvent } from "react";
import { Microphone, VideoCamera } from "@phosphor-icons/react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface Tile {
  name: string;
  hue: string;
  speaking?: boolean;
}

const TILES: Tile[] = [
  { name: "Mara", hue: "from-aurora to-aurora-soft", speaking: true },
  { name: "Teo", hue: "from-cyan-400 to-aurora-glow" },
  { name: "Yuki", hue: "from-fuchsia-400 to-aurora" },
  { name: "Ravi", hue: "from-emerald-400 to-cyan-400" },
];

/**
 * A genuine miniature of the room UI used as the hero visual — real components,
 * not a screenshot. Tilts toward the pointer with spring physics (decorative)
 * and floats gently; both collapse under reduced-motion.
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
          className="relative w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-3 shadow-float backdrop-blur-xl"
        >
          {/* top edge highlight */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="grid grid-cols-2 gap-2.5">
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
                <div className="absolute inset-0 grid place-items-center">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br ${tile.hue} text-sm font-semibold text-white shadow-lg`}
                  >
                    {tile.name.slice(0, 2)}
                  </span>
                </div>
                {tile.speaking && (
                  <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-aurora/40 animate-shimmer" />
                )}
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-200 backdrop-blur-sm">
                  {tile.name}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-slate-200">
              <Microphone size={16} weight="fill" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-slate-200">
              <VideoCamera size={16} weight="fill" />
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-500/90 text-white shadow-[0_8px_24px_-6px_rgba(244,63,94,0.6)]">
              <span className="h-1.5 w-4 rounded-full bg-white" />
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
