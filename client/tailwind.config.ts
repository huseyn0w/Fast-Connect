import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Bricolage Grotesque"', '"Inter"', "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        // Stronger custom curves — the built-in CSS easings are too weak.
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        smooth: "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      colors: {
        // Deep-space luxury palette.
        ink: {
          DEFAULT: "#070b14",
          soft: "#0c1322",
          card: "#111a2c",
        },
        aurora: {
          DEFAULT: "#7c5cff",
          soft: "#a78bfa",
          glow: "#22d3ee",
        },
        gold: "#e8c989",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,255,0.18), 0 20px 60px -20px rgba(124,92,255,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 80px -40px rgba(0,0,0,0.8)",
        // Layered, hue-tinted elevation for the hero preview — reads expensive.
        float:
          "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 2px 8px -2px rgba(0,0,0,0.4), 0 24px 50px -24px rgba(124,92,255,0.45), 0 60px 120px -50px rgba(0,0,0,0.85)",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(circle at 20% 20%, rgba(124,92,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(34,211,238,0.18), transparent 40%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-2000px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "drift-slow": "drift 220s linear infinite",
        "drift-med": "drift 140s linear infinite",
        "drift-fast": "drift 90s linear infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
        float: "float 7s cubic-bezier(0.45,0,0.55,1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
