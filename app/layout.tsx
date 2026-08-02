import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Streak Shield — protect your BasePaint streak",
  description:
    "A capped, slow-refilling shield mechanic that forgives an occasional missed BasePaint day without letting anyone buy their way out of showing up.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          <Header />
          <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
