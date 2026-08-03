import type { Metadata } from "next";
import { Roboto_Mono, Viga } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/**
 * Roboto Mono is BasePaint's UI/body typeface (https://basepaint.xyz/brand).
 * next/font self-hosts it at build time — no external CDN request at runtime.
 *
 * BasePaint's display faces, MEK Sans and MEK Mono, aren't freely
 * redistributable (they're sold at mek.gallery), so they're referenced by name
 * in the font stack — used if the viewer has them installed — and gracefully
 * fall back to Roboto Mono otherwise. See tailwind.config.ts.
 */
const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

/**
 * Viga is the face basepaint.xyz actually uses for its nav buttons — confirmed
 * from the live site's markup (`font-viga` on each nav item). Loading the real
 * one matters: it's what makes the recreated header read as BasePaint's rather
 * than "a blue bar with buttons."
 */
const viga = Viga({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-viga",
});

export const metadata: Metadata = {
  title: "Streak Shield — protect your BasePaint streak",
  description:
    "A capped, slow-refilling shield mechanic that forgives an occasional missed BasePaint day without letting anyone buy their way out of showing up.",
};

/**
 * Root layout is deliberately minimal — just providers, no app chrome. Route
 * groups underneath (like app/(dashboard)) own their own header/footer/shell,
 * so routes with a different visual identity (app/profile, the native-BasePaint
 * profile mockup) aren't forced into the Streak Shield app's own frame.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${robotoMono.variable} ${viga.variable}`}>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
