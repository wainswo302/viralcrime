import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlotterPeriod, allBlotterParams } from "@/lib/towns";

interface Params { params: { slug: string; period: string }; }

// Pre-render known blotter periods at build time; ISR refreshes them via
// listCases()'s revalidate. New periods still render on demand (dynamicParams).
export async function generateStaticParams() {
  return allBlotterParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const b = await getBlotterPeriod(params.slug, params.period);
  if (!b) return { title: "Blotter not found — ViralCrime" };
  const title = `${b.city} Police Blotter — ${b.label}`;
  return {
    title: `${title} | ViralCrime`,
    description: `Incidents surfaced in ${b.city}, ${b.state} during ${b.label}, sourced from official public records.`,
    alternates: { canonical: `/towns/${params.slug}/blotter/${params.period}` }
  };
}

export default async function BlotterPeriodPage({ params }: Params) {
  const b = await getBlotterPeriod(params.slug, params.period);
  if (!b) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${b.city} Police Blotter — ${b.label}`,
    about: { "@type": "Place", name: `${b.city}, ${b.state}` }
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Towns", item: "/towns" },
      { "@type": "ListItem", position: 2, name: `${b.city}, ${b.state}`, item: `/towns/${params.slug}` },
      { "@type": "ListItem", position: 3, name: b.label, item: `/towns/${params.slug}/blotter/${params.period}` }
    ]
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href={`/towns/${params.slug}`}>{b.city}, {b.state}</a>
        <span className="sep">/</span>
        <span>{b.label}</span>
      </nav>

      <p className="eyebrow">Blotter · {b.label}</p>
      <h1 className="headline">{b.city} Police Blotter — {b.label}</h1>
      <p className="lede">
        Incidents surfaced in {b.city}, {b.state} during {b.label}, sourced from official public
        records and tracked through to verified resolution.
      </p>

      <h2 className="section-title">Incidents this period</h2>
      <ul className="incidents">
        {b.incidents.map((i) => (
          <a className="incident" key={i.slug} href={`/cases/${i.slug}`}>
            <span className="incident__t">{i.title}</span>
            <span className={`incident__m ${i.resolved ? "resolved" : ""}`}>{i.meta}</span>
          </a>
        ))}
      </ul>

      <footer className="foot">
        <span><a href={`/towns/${params.slug}`}>All {b.city} incidents</a></span>
        <span><a href="/policy">How we source &amp; handle names</a></span>
      </footer>
    </main>
  );
}
