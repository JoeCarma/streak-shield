import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bp: {
          // From ai.txt's design-system section (what derivative apps are told to use).
          bg: "#1E2735",
          fg: "#ffffff",
          accent: "#fde047",
          header: "#073eb1",

          // The official brand palette from https://basepaint.xyz/brand. These are
          // the values the live site actually ships, and are what the /profile
          // concept page uses so it reads as a real BasePaint screen.
          blue: "#0042E0", // BasePaint Blue — primary brand color
          paper: "#FFFCEE",
          ink: "#000000",
          // Near-black chrome the live profile page sits on (darker than ai.txt's bg).
          surface: "#0B0B0E",
          card: "#141419",
        },
      },
      fontFamily: {
        // `--font-roboto-mono` is injected by next/font in app/layout.tsx, so the
        // real BasePaint UI typeface loads instead of falling through to the
        // system monospace. MEK Mono/Sans are BasePaint's display faces — not
        // freely redistributable, so they're used only if locally installed.
        mono: ["var(--font-roboto-mono)", "MEK Mono", "ui-monospace", "monospace"],
        sans: [
          "MEK Sans",
          "var(--font-roboto-mono)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        // The face basepaint.xyz uses on its nav buttons (`font-viga` in the
        // live markup). Loaded via next/font in app/layout.tsx.
        viga: ["var(--font-viga)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
