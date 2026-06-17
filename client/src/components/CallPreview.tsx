import { Microphone, VideoCamera } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "framer-motion";

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
 * not a screenshot. Avatars use initials; no fake faces or stock people.
 */
export function CallPreview() {
  const reduce = useReducedMotion();
  return (
    <div className="glass w-full max-w-md p-3">
      <div className="grid grid-cols-2 gap-2.5">
        {TILES.map((tile, i) => (
          <motion.div
            key={tile.name}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`relative aspect-video overflow-hidden rounded-xl border bg-ink-card ${
              tile.speaking ? "border-aurora/60 shadow-glow" : "border-white/10"
            }`}
          >
            <div className="absolute inset-0 grid place-items-center">
              <span
                className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${tile.hue} text-sm font-semibold text-white`}
              >
                {tile.name.slice(0, 2)}
              </span>
            </div>
            <span className="absolute bottom-1.5 left-1.5 rounded-md bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-200">
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
        <span className="grid h-9 w-9 place-items-center rounded-full bg-rose-500/90 text-white">
          <span className="h-1.5 w-4 rounded-full bg-white" />
        </span>
      </div>
    </div>
  );
}
