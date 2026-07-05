import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTown, allTownSlugs } from "@/lib/towns";

interface Params { params: { slug: string }; }

// Pre-render known towns at build time (SEO + speed); ISR refreshes them via
// listCases()'s revalidate. New towns still render on demand (dynamicParams).
export async function generateStaticParams() {
  return (await allTownSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = await getTown(params.slug);
  if (!t) return { title: "Town not found — ViralCrime" };
  const title = `${t.city}, ${t.state} — crime & public safety records`;
  return {
    title: `${title} | ViralCrime`,
    description: t.blurb,
    alternates: { canonical: `/towns/${t.slug}` }
  };
}

export default async function TownHub({ params }: Params) {
  const t = await getTown(params.slug);
  if (!t) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${t.city}, ${t.state} — crime & public safety`,
    about: { "@type": "Place", name: `${t.city}, ${t.state}` }
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Towns", item: "/towns" },
      { "@type": "ListItem", position: 2, name: `${t.city}, ${t.state}`, item: `/towns/${t.slug}` }
    ]
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <p className="eyebrow">Town record{t.county ? ` · ${t.county} County` : ""}</p>
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

      {t.blotterPeriods.length > 0 && (
        <>
          <h2 className="section-title">Blotter</h2>
          <ul className="incidents">
            {t.blotterPeriods.map((b) => (
              <a className="incident" key={b.period} href={`/towns/${t.slug}/blotter/${b.period}`}>
                <span className="incident__t">{b.label}</span>
                <span className="incident__m">{b.count} incident{b.count === 1 ? "" : "s"}</span>
              </a>
            ))}
          </ul>
        </>
      )}

      {t.locations.length > 0 && (
        <>
          <h2 className="section-title">By location</h2>
          <ul className="incidents">
            {t.locations.map((l) => (
              <a className="incident" key={l.slug} href={`/towns/${t.slug}/${l.slug}`}>
                <span className="incident__t">{l.street}</span>
                <span className="incident__m">{l.count} incident{l.count === 1 ? "" : "s"}</span>
              </a>
            ))}
          </ul>
        </>
      )}

      <footer className="foot">
        <span>Sourced from official records</span>
        <span><a href="/policy">How we source &amp; handle names</a></span>
      </footer>
    </main>
  );
}
