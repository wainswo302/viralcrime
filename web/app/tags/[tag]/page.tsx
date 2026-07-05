import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTagCases, allTagSlugs } from "@/lib/tags";

interface Params { params: { tag: string }; }

export async function generateStaticParams() {
  return (await allTagSlugs()).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = await getTagCases(params.tag);
  if (!t) return { title: "Tag not found — ViralCrime" };
  return {
    title: `${t.label} | ViralCrime`,
    description: `Cases tagged "${t.label}".`,
    alternates: { canonical: `/tags/${t.slug}` }
  };
}

export default async function TagPage({ params }: Params) {
  const t = await getTagCases(params.tag);
  if (!t) notFound();

  return (
    <main className="wrap">
      <p className="eyebrow">Tag</p>
      <h1 className="headline">{t.label}</h1>
      <p className="lede">{t.cases.length} case{t.cases.length === 1 ? "" : "s"} tagged &ldquo;{t.label}&rdquo;.</p>
      <ul className="incidents">
        {t.cases.map((c) => (
          <a className="incident" key={c.slug} href={`/cases/${c.slug}`}>
            <span className="incident__t">{c.headline}</span>
            <span className="incident__m">{c.jurisdictionCity}, {c.jurisdictionState}</span>
          </a>
        ))}
      </ul>
    </main>
  );
}
