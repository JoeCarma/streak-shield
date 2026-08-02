import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/**
 * Layout for the Streak Shield app's own dashboard routes (/ and /leaderboard).
 * Carries the Streak Shield branded header/footer/max-width shell. Kept out of
 * the root layout so other routes — like /profile, the native-BasePaint-profile
 * mockup — can render full-bleed without the Streak Shield chrome on top.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
