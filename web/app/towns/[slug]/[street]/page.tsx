import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocationSpoke, allLocationParams, getTown } from "@/lib/towns";

interface Params { params: { slug: string; street: string }; }

// Pre-render known location spokes at build time; ISR refreshes them via
// listCases()'s revalidate. New streets still render on demand (dynamicParams).
export async function generateStaticParams() {
  return allLocationParams();
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const loc = await getLocationSpoke(params.slug, params.street);
  if (!loc) return { title: "Location not found — ViralCrime" };
  const title = `Crime on ${loc.street} — ${loc.city}, ${loc.state}`;
  return {
    title: `${title} | ViralCrime`,
    description: `Incidents on ${loc.street} in ${loc.city}, ${loc.state}, sourced from official public records.`,
    alternates: { canonical: `/towns/${params.slug}/${params.street}` }
  };
}

export default async function LocationSpokePage({ params }: Params) {
  const [loc, town] = await Promise.all([
    getLocationSpoke(params.slug, params.street),
    getTown(params.slug)
  ]);
  if (!loc) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Crime on ${loc.street} — ${loc.city}, ${loc.state}`,
    about: { "@type": "Place", name: `${loc.street}, ${loc.city}, ${loc.state}` }
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Towns", item: "/towns" },
      { "@type": "ListItem", position: 2, name: `${loc.city}, ${loc.state}`, item: `/towns/${params.slug}` },
      { "@type": "ListItem", position: 3, name: loc.street, item: `/towns/${params.slug}/${params.street}` }
    ]
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href={`/towns/${params.slug}`}>{loc.city}, {loc.state}</a>
        <span className="sep">/</span>
        <span>{loc.street}</span>
      </nav>

      <p className="eyebrow">Location record</p>
      <h1 className="headline">Crime on {loc.street} — {loc.city}, {loc.state}</h1>
      <p className="lede">
        Incidents reported on {loc.street} in {loc.city}, {loc.state}, sourced from official public
        records and tracked through to verified resolution.
      </p>

      <h2 className="section-title">Incidents on {loc.street}</h2>
      <ul className="incidents">
        {loc.incidents.map((i) => (
          <a className="incident" key={i.slug} href={`/cases/${i.slug}`}>
            <span className="incident__t">{i.title}</span>
            <span className={`incident__m ${i.resolved ? "resolved" : ""}`}>{i.meta}</span>
          </a>
        ))}
      </ul>

      <footer className="foot">
        <span>{town ? <a href={`/towns/${params.slug}`}>All {loc.city} incidents</a> : "Sourced from official records"}</span>
        <span><a href="/policy">How we source &amp; handle names</a></span>
      </footer>
    </main>
  );
}
