import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Google Cloud inspired palette
        "gc-blue": "#1F2937",
        "gc-light": "#F9FAFB",
        "gc-gray": "#6B7280",
        // Primary accent colors (Google Cloud style)
        "gc-primary-blue": "#1E40AF",
        "gc-primary-red": "#DC2626",
        "gc-primary-orange": "#EA580C",
        "gc-primary-green": "#059669",
        "gc-primary-purple": "#7C3AED",
        "gc-primary-cyan": "#0891B2",
        // Bright highlight colors
        "gc-bright-blue": "#3B82F6",
        "gc-bright-red": "#EF4444",
        "gc-bright-orange": "#F97316",
        "gc-bright-green": "#10B981",
        "gc-bright-purple": "#A855F7",
        "gc-bright-cyan": "#06B6D4",
        // Legacy aliases for compatibility
        canvas: "#FFFFFF",
        ink: "#0F172A",
        accent: "#3B82F6",
        "accent-pink": "#EC4899",
        "accent-purple": "#A855F7",
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
