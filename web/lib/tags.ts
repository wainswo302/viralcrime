import type { CaseSummaryDto } from "./types";
import { listCases } from "./api";

export interface TagLink { slug: string; label: string; count: number; }
export interface TagPage { slug: string; label: string; cases: CaseSummaryDto[]; }

export function slugifyTag(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
const slugify = slugifyTag;

// A case's tag set is eventType (the controlled classification) union its
// free-form tags — one browsable namespace, so /tags/assault and /tags/viral
// both just work the same way.
function tagsFor(c: CaseSummaryDto): string[] {
  return Array.from(new Set([c.eventType, ...c.tags].filter(Boolean)));
}

export async function allTags(): Promise<TagLink[]> {
  const cases = await listCases();
  const bySlug = new Map<string, { label: string; count: number }>();

  for (const c of cases) {
    for (const tag of tagsFor(c)) {
      const slug = slugify(tag);
      const existing = bySlug.get(slug);
      if (existing) existing.count += 1;
      else bySlug.set(slug, { label: tag, count: 1 });
    }
  }

  return Array.from(bySlug.entries())
    .map(([slug, v]) => ({ slug, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count);
}

export async function getTagCases(tagSlug: string): Promise<TagPage | null> {
  const cases = await listCases();
  const matches = cases.filter((c) => tagsFor(c).some((t) => slugify(t) === tagSlug));
  if (matches.length === 0) return null;

  // Prefer a free-form tag's original casing over eventType's for the label,
  // since eventType is often an underscore_case identifier, not display text.
  const label =
    matches.flatMap((c) => c.tags).find((t) => slugify(t) === tagSlug) ??
    matches.map((c) => c.eventType).find((t) => slugify(t) === tagSlug) ??
    tagSlug;

  return {
    slug: tagSlug,
    label,
    cases: matches.slice().sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? ""))
  };
}

export async function allTagSlugs(): Promise<string[]> {
  return (await allTags()).map((t) => t.slug);
}
