import type { Metadata } from "next";
import { allFixtureSlugs } from "@/lib/api";
import { FIXTURE } from "@/lib/fixture";

export const metadata: Metadata = {
  title: "Cases | ViralCrime",
  description: "Viral crime incidents tracked to verified resolution."
};

export default function CasesIndex() {
  const slugs = allFixtureSlugs();
  return (
    <main className="wrap">
      <p className="eyebrow">Case index</p>
      <h1 className="headline">Cases</h1>
      <ul className="incidents">
        {slugs.map((s) => {
          const c = FIXTURE[s];
          return (
            <a className="incident" key={s} href={`/cases/${s}`}>
              <span className="incident__t">{c.headline}</span>
              <span className="incident__m">{c.jurisdictionCity}, {c.jurisdictionState}</span>
            </a>
          );
        })}
      </ul>
    </main>
  );
}
