import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,jsx,js}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#99F6E4", // Mint Pastel
          foreground: "#0F1115",
        },
        border: "rgba(148, 163, 184, 0.1)",
        input: "rgba(148, 163, 184, 0.1)",
        background: "#0F1115",
        foreground: "#E2E8F0",
        surface: "#161920",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        elevated: "0px 20px 45px -25px rgba(0, 0, 0, 0.8)",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
