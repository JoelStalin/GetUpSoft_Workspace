import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        "bg-deep": "#0F1115",
        "bg-surface": "#161920",
        "bg-elevated": "#1C2028",
        // Text
        "text-main": "#E2E8F0",
        "text-muted": "#64748B",
        "text-soft": "#94A3B8",
        // Global portal accent (pastel blue / indigo)
        "accent-global": "#A5B4FC",
        "accent-global-dim": "rgba(165,180,252,0.15)",
        // RD portal accent (mint / teal)
        "accent-rd": "#99F6E4",
        "accent-rd-dim": "rgba(153,246,228,0.15)",
        // Shared neutrals
        "border-subtle": "rgba(255,255,255,0.07)",
        "border-mid": "rgba(255,255,255,0.12)",
        // Legacy aliases kept for existing components
        canvas: "#0F1115",
        ink: "#E2E8F0",
        accent: "#A5B4FC",
        "accent-pink": "#F0ABFC",
        "accent-purple": "#C084FC",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        display: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "grid-subtle": "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "gradient-global": "radial-gradient(circle at 50% -20%, #1e293b, transparent 70%)",
        "gradient-rd": "radial-gradient(circle at 30% 10%, rgba(153,246,228,0.06), transparent 60%)",
      },
      animation: {
        "glow-slow": "glow 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse-slow": "spin 15s linear infinite reverse",
      },
      keyframes: {
        glow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.7" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
