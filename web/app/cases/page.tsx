import type { Metadata } from "next";
import { listCases } from "@/lib/api";

export const metadata: Metadata = {
  title: "Cases | ViralCrime",
  description: "Viral crime incidents tracked to verified resolution."
};

export default async function CasesIndex() {
  const cases = await listCases();
  return (
    <main className="wrap">
      <p className="eyebrow">Case index</p>
      <h1 className="headline">Cases</h1>
      <ul className="incidents">
        {cases.map((c) => (
          <a className="incident" key={c.slug} href={`/cases/${c.slug}`}>
            <span className="incident__t">{c.headline}</span>
            <span className="incident__m">{c.jurisdictionCity}, {c.jurisdictionState}</span>
          </a>
        ))}
      </ul>
    </main>
  );
}
