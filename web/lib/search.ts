import { listCases } from "./api";
import { allTowns } from "./towns";

export interface SearchEntry {
  type: "case" | "town" | "page";
  title: string;
  description: string;
  url: string;
}

// Fixed content pages don't change, so there's nothing to index dynamically —
// just describe them once.
const STATIC_PAGES: SearchEntry[] = [
  { type: "page", title: "About", description: "What ViralCrime tracks, and why.", url: "/about" },
  {
    type: "page",
    title: "Disclosure & Corrections Policy",
    description: "How we source claims, handle names, and issue corrections.",
    url: "/policy"
  }
];

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const [cases, towns] = await Promise.all([listCases(), allTowns()]);

  const caseEntries: SearchEntry[] = cases.map((c) => ({
    type: "case",
    title: c.headline,
    description: [c.eventType, `${c.jurisdictionCity}, ${c.jurisdictionState}`, ...c.tags].join(" · "),
    url: `/cases/${c.slug}`
  }));

  const townEntries: SearchEntry[] = towns.map((t) => ({
    type: "town",
    title: `${t.city}, ${t.state}`,
    description: t.blurb,
    url: `/towns/${t.slug}`
  }));

  return [...caseEntries, ...townEntries, ...STATIC_PAGES];
}

export function searchIndex(index: SearchEntry[], query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index.filter(
    (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
  );
}
