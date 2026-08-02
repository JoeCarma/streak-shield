import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // BasePaint brand palette (see https://basepaint.xyz/brand)
        bp: {
          bg: "#1E2735",
          fg: "#ffffff",
          accent: "#fde047",
          header: "#073eb1",
        },
      },
      fontFamily: {
        mono: ["Roboto Mono", "MEK Mono", "ui-monospace", "monospace"],
        sans: ["MEK Sans", "Roboto Mono", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
