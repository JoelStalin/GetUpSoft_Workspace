import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#020617",
        ink: "#f8fafc",
        accent: "#0ea5e9", // Neon Cyan
        "accent-pink": "#ec4899", // Neon Pink
        "accent-purple": "#a855f7", // Neon Purple
        border: "rgba(255, 255, 255, 0.1)",
        input: "rgba(255, 255, 255, 0.05)",
        background: "#020617",
        foreground: "#f8fafc",
        card: "rgba(15, 23, 42, 0.6)",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      animation: {
        "glow-slow": "glow 8s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
