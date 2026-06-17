import { Link } from "react-router-dom";

/** Wordmark with a small geometric "signal" mark. */
export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5 focus-ring rounded-lg">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-aurora to-aurora-glow shadow-glow">
        <span className="h-2.5 w-2.5 rounded-full bg-white animate-shimmer" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        Fast<span className="text-aurora-soft">Connect</span>
      </span>
    </Link>
  );
}
