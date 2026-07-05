import type { CaseDto, CaseSummaryDto } from "./types";
import { FIXTURE } from "./fixture";

const BASE = process.env.API_BASE_URL ?? "http://localhost:8080";

function fixtureSummaries(): CaseSummaryDto[] {
  return Object.values(FIXTURE).map((c) => ({
    slug: c.slug,
    headline: c.headline,
    eventType: c.eventType,
    jurisdictionCity: c.jurisdictionCity,
    jurisdictionCounty: c.jurisdictionCounty,
    jurisdictionState: c.jurisdictionState,
    state: c.state,
    incidentDate: c.incidentDate,
    videoProvenance: c.videoProvenance,
    embedRefs: c.embedRefs
  }));
}

/** Published cases for grid/index views. Falls back to fixtures when the backend is unreachable. */
export async function listCases(): Promise<CaseSummaryDto[]> {
  try {
    const res = await fetch(`${BASE}/api/cases`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as CaseSummaryDto[];
  } catch {
    return fixtureSummaries();
  }
}

/**
 * Fetch a case by slug. Falls back to the local fixture when the backend is
 * unreachable (so the site renders during frontend-only development). In
 * production with the API up, the live response always wins.
 */
export async function getCase(slug: string): Promise<CaseDto | null> {
  try {
    const res = await fetch(`${BASE}/api/cases/${slug}`, {
      next: { revalidate: 300 } // ISR: refresh every 5 min
    });
    if (res.status === 404) return FIXTURE[slug] ?? null;
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as CaseDto;
  } catch {
    return FIXTURE[slug] ?? null;
  }
}

export function allFixtureSlugs(): string[] {
  return Object.keys(FIXTURE);
}
