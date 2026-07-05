import type { Metadata } from "next";
import { buildSearchIndex, searchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search | ViralCrime",
  description: "Search cases, towns, and site pages."
};

interface Props { searchParams: { q?: string }; }

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q ?? "";
  const results = q ? searchIndex(await buildSearchIndex(), q) : [];

  return (
    <main className="wrap">
      <p className="eyebrow">Search</p>
      <h1 className="headline">Search</h1>

      <form action="/search" style={{ margin: "0 0 2rem" }}>
        <input
          className="field__input"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search cases, towns, pages…"
          autoFocus
        />
      </form>

      {q && (
        <p className="lede" style={{ fontSize: "1rem" }}>
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {q && results.length === 0 && <p>Nothing matched.</p>}

      <ul className="incidents">
        {results.map((r) => (
          <a className="incident" key={r.url} href={r.url}>
            <span className="incident__t">{r.title}</span>
            <span className="incident__m">{r.type} · {r.description}</span>
          </a>
        ))}
      </ul>
    </main>
  );
}
