import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // V8 Aesthetic Minimalist Palette
        background: "#FFFFFF",
        surface: "#F8FAFC", // Slate 50
        surfaceElevated: "#F1F5F9", // Slate 100
        surfaceSoft: "#E2E8F0", // Slate 200
        border: "rgba(15, 23, 42, 0.06)",
        borderStrong: "rgba(15, 23, 42, 0.12)",
        text: "#0F172A", // Slate 900
        textMuted: "#475569", // Slate 600
        textSubtle: "#94A3B8", // Slate 400

        // Accent Colors (Pastel Opaque)
        primary: "#3B82F6",
        primarySoft: "#DBEAFE",
        accentTeal: "#14B8A6",
        accentTealSoft: "#CCFBF1",
        accentPurple: "#8B5CF6",
        accentPurpleSoft: "#EDE9FE",
        accentCoral: "#F43F5E",
        accentCoralSoft: "#FFE4E6",

        // Semantic
        warning: "#F59E0B",
        success: "#10B981",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        display: ["Inter", "Plus Jakarta Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "grid-subtle": "radial-gradient(circle, rgba(15,23,42,0.03) 1px, transparent 1px)",
        "gradient-aesthetic": "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
      },
      animation: {
        "fade-in-slow": "fadeIn 1s ease-out",
        "float-soft": "floatSoft 8s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      boxShadow: {
        "soft-xl": "0 4px 24px rgba(0,0,0,0.03)",
        "soft-2xl": "0 10px 48px rgba(0,0,0,0.05)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
