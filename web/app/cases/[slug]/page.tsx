import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCase, listCases } from "@/lib/api";
import { slugifyTag } from "@/lib/tags";
import { buildAllJsonLd } from "@/lib/schema";
import { formatDate } from "@/lib/status";
import { StatusTags } from "@/components/StatusTags";
import { VerificationRecord } from "@/components/VerificationRecord";
import { EmbedBlock } from "@/components/EmbedBlock";
import { CaseTimeline } from "@/components/CaseTimeline";
import { SourceList } from "@/components/SourceList";

interface Params { params: { slug: string }; }

// Pre-render known cases at build time (SEO + speed); ISR refreshes them.
export async function generateStaticParams() {
  return (await listCases()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const c = await getCase(params.slug);
  if (!c) return { title: "Case not found — ViralCrime" };
  return {
    title: `${c.headline} | ViralCrime`,
    description: c.summary ?? undefined,
    alternates: { canonical: `/cases/${c.slug}` },
    openGraph: { title: c.headline, description: c.summary ?? undefined, type: "article" }
  };
}

export default async function CasePage({ params }: Params) {
  const c = await getCase(params.slug);
  if (!c) notFound();

  const jsonLd = buildAllJsonLd(c);
  const place = [c.jurisdictionCity, c.jurisdictionState].filter(Boolean).join(", ");
  const dateline = [place, formatDate(c.incidentDate)].filter(Boolean).join(" · ");

  return (
    <main className="wrap">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/cases">Cases</a>
        <span className="sep">/</span>
        <span>{c.jurisdictionState}</span>
        <span className="sep">/</span>
        <span>{c.jurisdictionCity}</span>
      </nav>

      <p className="eyebrow">Case record · {place}</p>
      <h1 className="headline">{c.headline}</h1>

      <StatusTags c={c} />
      <VerificationRecord c={c} />
      <EmbedBlock c={c} />

      {c.summary && (
        <>
          <p className="dateline">
            {dateline}
            {c.sources[0] ? ` · Source: ${c.sources[0].label ?? "official record"}` : ""}
          </p>
          <p className="lede">{c.summary}</p>
        </>
      )}

      {c.namedIndividuals.length > 0 && (
        <p className="dateline" style={{ marginTop: "-1.5rem", marginBottom: "2.5rem" }}>
          Defendant of record: {c.namedIndividuals.join(", ")}
        </p>
      )}

      <CaseTimeline c={c} />
      <SourceList c={c} />

      <div className="tags" style={{ marginTop: "-1rem" }}>
        <a className="tag-link" href={`/tags/${slugifyTag(c.eventType)}`}>#{c.eventType}</a>
        {c.tags.map((t) => (
          <a className="tag-link" key={t} href={`/tags/${slugifyTag(t)}`}>#{t}</a>
        ))}
      </div>

      <footer className="foot">
        <span>By staff editor · last verified {formatDate(c.lastVerifiedAt)}</span>
        <span>Corrections: corrections@viralcrime.example</span>
      </footer>
    </main>
  );
}
