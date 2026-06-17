import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl font-medium transition-[transform,box-shadow,background-color,filter] duration-200 ease-out-quint focus-ring active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-aurora to-aurora-soft font-semibold text-ink shadow-glow hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(56,189,248,0.3),0_26px_70px_-22px_rgba(56,189,248,0.6)]",
  secondary:
    "border border-white/12 bg-white/[0.04] text-white hover:-translate-y-px hover:border-white/20 hover:bg-white/[0.07]",
  ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
  danger: "bg-rose-500/90 text-white hover:-translate-y-px hover:bg-rose-500",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

/** App button. Variants share one radius scale and consistent tactile feedback. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out-quint group-hover:translate-x-full"
        />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
