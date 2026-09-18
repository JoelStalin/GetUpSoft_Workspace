import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // GetUpSoft Design System (Phase 1) — Dark Enterprise Theme
        // https://docs.getupsoft.local/design-system.md§2

        // Backgrounds & Surfaces (dark theme)
        background: "#070B12",
        surface: "#0D1320",
        "surface-elevated": "#111827",
        "surface-soft": "#162033",

        // Borders
        border: "rgba(148, 163, 184, 0.18)",
        "border-strong": "rgba(226, 232, 240, 0.28)",

        // Text Colors
        text: "#E5E7EB",
        "text-muted": "#94A3B8",
        "text-subtle": "#64748B",

        // Semantic Colors
        primary: "#5EEAD4",
        "primary-strong": "#14B8A6",
        "accent-blue": "#60A5FA",
        "accent-violet": "#A78BFA",
        warning: "#F97316",
        success: "#22C55E",
        danger: "#EF4444",

        // Legacy aliases for compatibility (will deprecate)
        canvas: "#FFFFFF",
        ink: "#0F172A",
        accent: "#3B82F6",
        "accent-pink": "#EC4899",
        "accent-purple": "#A855F7",
        "gc-blue": "#1F2937",
        "gc-light": "#F9FAFB",
        "gc-gray": "#6B7280",
        "gc-primary-blue": "#1E40AF",
        "gc-primary-red": "#DC2626",
        "gc-primary-orange": "#EA580C",
        "gc-primary-green": "#059669",
        "gc-primary-purple": "#7C3AED",
        "gc-primary-cyan": "#0891B2",
        "gc-bright-blue": "#3B82F6",
        "gc-bright-red": "#EF4444",
        "gc-bright-orange": "#F97316",
        "gc-bright-green": "#10B981",
        "gc-bright-purple": "#A855F7",
        "gc-bright-cyan": "#06B6D4",
      },
      fontFamily: {
        // Headings: Inter, Geist, Satoshi (master prompt §6.3)
        sans: ["Inter", "Geist Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        heading: ["Inter", "Geist Sans", "Satoshi", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        // Technical/decorative
        mono: ["JetBrains Mono", "IBM Plex Mono", "Courier New", "monospace"],
        // Legacy
        display: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
      },
      // Typography scale (master prompt §6.3)
      fontSize: {
        // Hero H1: 72–96px desktop, 42–56px mobile
        "h1-hero-desktop": ["72px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "h1-hero-mobile": ["42px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        // Section H2: 44–64px desktop, 34–44px mobile
        "h2-section": ["44px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "h2-section-mobile": ["34px", { lineHeight: "1.2" }],
        // Body: 16–18px
        body: ["16px", { lineHeight: "1.6" }],
        "body-lg": ["18px", { lineHeight: "1.6" }],
        // Small/metadata: 12–14px
        small: ["12px", { lineHeight: "1.5" }],
        "small-md": ["14px", { lineHeight: "1.5" }],
        // Eyebrow: 11–12px uppercase tracking-wide
        eyebrow: ["12px", { lineHeight: "1.5", textTransform: "uppercase", letterSpacing: "0.1em" }],
      },

      // Spacing scale (master prompt §3)
      spacing: {
        xs: "0.25rem", // 4px
        sm: "0.5rem",  // 8px
        md: "1rem",    // 16px
        lg: "1.5rem",  // 24px
        xl: "2rem",    // 32px
        "2xl": "3rem", // 48px
        "3xl": "4rem", // 64px
        "4xl": "6rem", // 96px
        "5xl": "8rem", // 128px
      },

      // Max-width container (master prompt §6.4)
      maxWidth: {
        container: "1200px",
        "container-xl": "1280px",
      },

      backgroundImage: {
        "grid-subtle": "radial-gradient(circle, rgba(148,163,184,0.08) 1px, transparent 1px)",
        "gradient-global": "radial-gradient(circle at 50% -20%, #1e293b, transparent 70%)",
        "gradient-rd": "radial-gradient(circle at 30% 10%, rgba(153,246,228,0.06), transparent 60%)",
      },
      // Animations (master prompt §6.4 — respect prefers-reduced-motion)
      animation: {
        "glow-slow": "glow 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "spin-reverse-slow": "spin 15s linear infinite reverse",
        "fade-in": "fadeIn 200ms ease-in",
        "slide-up": "slideUp 300ms ease-out",
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
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },

      // Shadow presets for card hover effects (master prompt §6.4)
      boxShadow: {
        "glow-teal": "0 0 20px rgba(94, 234, 212, 0.4)",
        "glow-orange": "0 0 20px rgba(249, 115, 22, 0.4)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.3)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
