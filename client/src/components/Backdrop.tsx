/**
 * Fixed deep-space backdrop: layered aurora glows plus three drifting star
 * layers at different speeds for parallax depth. Purely decorative and
 * non-interactive; honors reduced-motion via the CSS in index.css.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* Aurora glows */}
      <div className="absolute -left-1/4 -top-1/3 h-[60vmax] w-[60vmax] rounded-full bg-aurora/20 blur-[120px]" />
      <div className="absolute -right-1/4 top-0 h-[45vmax] w-[45vmax] rounded-full bg-aurora-glow/10 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-[40vmax] w-[40vmax] rounded-full bg-aurora-soft/10 blur-[120px]" />

      {/* Drifting stars */}
      <div
        className="stars absolute inset-x-0 top-0 h-[4000px] animate-drift-slow opacity-60"
        style={{ backgroundSize: "180px 180px", ["--x" as string]: "40px", ["--y" as string]: "70px" }}
      />
      <div
        className="stars absolute inset-x-0 top-0 h-[4000px] animate-drift-med opacity-40"
        style={{ backgroundSize: "320px 320px", ["--x" as string]: "120px", ["--y" as string]: "200px" }}
      />
      <div
        className="stars absolute inset-x-0 top-0 h-[4000px] animate-drift-fast opacity-30"
        style={{ backgroundSize: "500px 500px", ["--x" as string]: "260px", ["--y" as string]: "420px" }}
      />

      {/* Vignette to seat content */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,11,20,0.9)_100%)]" />
    </div>
  );
}
