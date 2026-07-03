import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOWNS, allTownSlugs } from "@/lib/towns";

interface Params { params: { slug: string }; }

export async function generateStaticParams() {
  return allTownSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = TOWNS[params.slug];
  if (!t) return { title: "Town not found — ViralCrime" };
  const title = `${t.city}, ${t.state} — crime & public safety records`;
  return {
    title: `${title} | ViralCrime`,
    description: t.blurb,
    alternates: { canonical: `/towns/${t.slug}` }
  };
}

export default function TownHub({ params }: Params) {
  const t = TOWNS[params.slug];
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${t.city}, ${t.state} — crime & public safety`,
    about: { "@type": "Place", name: `${t.city}, ${t.state}` }
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="eyebrow">Town record · {t.county} County</p>
      <h1 className="headline">{t.city}, {t.state} — crime &amp; public safety</h1>
      <p className="lede">{t.blurb}</p>

      <div className="stats">
        <div className="stat"><p className="stat__k">Tracked incidents</p><p className="stat__n">{t.stats.tracked}</p></div>
        <div className="stat"><p className="stat__k">Resolved cases</p><p className="stat__n">{t.stats.resolved}</p></div>
        <div className="stat"><p className="stat__k">Videos verified</p><p className="stat__n">{t.stats.verified}</p></div>
      </div>

      <h2 className="section-title">Recent incidents</h2>
      <ul className="incidents">
        {t.incidents.map((i) => (
          <a className="incident" key={i.slug} href={`/cases/${i.slug}`}>
            <span className="incident__t">{i.title}</span>
            <span className={`incident__m ${i.resolved ? "resolved" : ""}`}>{i.meta}</span>
          </a>
        ))}
      </ul>

      <footer className="foot">
        <span>Sourced from official records</span>
        <span><a href="/policy">How we source &amp; handle names</a></span>
      </footer>
    </main>
  );
}
