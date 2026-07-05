import type { Metadata } from "next";
import { allTowns } from "@/lib/towns";

export const metadata: Metadata = {
  title: "Towns | ViralCrime",
  description: "Every town we track — crime and public safety records by jurisdiction."
};

export default async function TownsIndex() {
  const towns = await allTowns();
  return (
    <main className="wrap">
      <p className="eyebrow">Town index</p>
      <h1 className="headline">Towns</h1>
      <ul className="incidents">
        {towns.map((t) => (
          <a className="incident" key={t.slug} href={`/towns/${t.slug}`}>
            <span className="incident__t">{t.city}, {t.state}</span>
            <span className="incident__m">{t.stats.tracked} tracked · {t.stats.resolved} resolved</span>
          </a>
        ))}
      </ul>
    </main>
  );
}
