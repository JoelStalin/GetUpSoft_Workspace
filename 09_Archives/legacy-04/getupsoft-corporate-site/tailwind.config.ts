import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f5efe5",
        ink: "#10243d",
        accent: "#0f766e",
        border: "#1e3a8a",
        input: "#1e3a8a",
        background: "#0A192F",
        foreground: "#ffffff",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
