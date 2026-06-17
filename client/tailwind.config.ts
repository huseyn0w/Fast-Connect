import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Clash Display"', '"Inter"', "system-ui", "sans-serif"],
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
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        "drift-slow": "drift 220s linear infinite",
        "drift-med": "drift 140s linear infinite",
        "drift-fast": "drift 90s linear infinite",
        shimmer: "shimmer 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
