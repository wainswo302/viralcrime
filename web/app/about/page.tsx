import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ViralCrime",
  description: "What ViralCrime tracks, and why — the short version. See /policy for the full editorial and disclosure policy."
};

export default function AboutPage() {
  return (
    <main className="wrap">
      <p className="eyebrow">About</p>
      <h1 className="headline">The part the internet usually skips</h1>
      <div className="prose">
        <p className="lede">
          We track crime-related incidents that surface on social media, from the viral moment
          through to their verified resolution — the charge, the court disposition, and whether
          the video everyone shared was even real.
        </p>
        <p>
          Most coverage of a viral clip stops the day it stops trending. We keep watching: is the
          footage authentic or miscaptioned, what actually happened in court, and whether the
          case gets corrected, retracted, or expunged months later. That epilogue is the thing no
          outlet bothers to compile — so we built a system whose whole job is to catch it.
        </p>
        <p>
          We are an editorial publication built on primary sources — official records and
          established news coverage, never speculation. How we handle names, sourcing, and
          corrections is spelled out in full on our{" "}
          <a href="/policy">disclosure and corrections policy</a>.
        </p>
      </div>
    </main>
  );
}
