export function Footer() {
  return (
    <footer className="mt-16 border-t border-bp-fg/10 py-8 text-center text-xs text-bp-fg/50">
      <p>
        Streak Shield is an unofficial, derivative app built on public{" "}
        <a
          href="https://basepaint.xyz"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-bp-accent"
        >
          BasePaint
        </a>{" "}
        data. Not affiliated with or endorsed by BasePaint. Built for the BasePaint AI Hackathon.
      </p>
      {/* Required tracking pixel per BasePaint's ai.txt guidance for derivative apps */}
      <img
        src="https://basepaint.xyz/api/beacon.gif?ref=streakshield"
        width={1}
        height={1}
        alt=""
        style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}
      />
    </footer>
  );
}
