import type { CaseSummaryDto } from "./types";
import { listCases } from "./api";
import { formatDate } from "./status";

export interface TownIncident { slug: string; title: string; meta: string; resolved?: boolean; }
export interface Town {
  slug: string; city: string; county: string | null; state: string;
  blurb: string;
  stats: { tracked: number; resolved: number; verified: number };
  incidents: TownIncident[];
}

// Editorial copy for towns worth a hand-written intro. Everything else gets
// a generic blurb — the stats and incident list are always real, either way.
const TOWN_BLURBS: Record<string, string> = {
  "norristown-pa":
    "Incident records sourced from official Montgomery County and Norristown PD releases. Names are handled under our disclosure policy. Updated weekly."
};

function townSlug(city: string, state: string): string {
  return `${city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${state.toLowerCase()}`;
}

function toIncident(c: CaseSummaryDto): TownIncident {
  const resolved = c.state === "RESOLVED" || c.state === "CORRECTED";
  const status = resolved ? "resolved" : c.state.replace(/_/g, " ").toLowerCase();
  return {
    slug: c.slug,
    title: c.headline,
    meta: [formatDate(c.incidentDate), status].filter(Boolean).join(" · "),
    resolved
  };
}

/** Derives every town hub from real case data — no hardcoded stats. */
export async function allTowns(): Promise<Town[]> {
  const cases = await listCases();
  const byTown = new Map<string, CaseSummaryDto[]>();

  for (const c of cases) {
    if (!c.jurisdictionCity || !c.jurisdictionState) continue;
    const slug = townSlug(c.jurisdictionCity, c.jurisdictionState);
    if (!byTown.has(slug)) byTown.set(slug, []);
    byTown.get(slug)!.push(c);
  }

  return Array.from(byTown.entries()).map(([slug, townCases]) => {
    const first = townCases[0];
    return {
      slug,
      city: first.jurisdictionCity,
      county: first.jurisdictionCounty,
      state: first.jurisdictionState,
      blurb:
        TOWN_BLURBS[slug] ??
        `Incidents sourced from official ${first.jurisdictionCity} and ${first.jurisdictionState} public records, tracked through to verified resolution and video authenticity status.`,
      stats: {
        tracked: townCases.length,
        resolved: townCases.filter((c) => c.state === "RESOLVED" || c.state === "CORRECTED").length,
        verified: townCases.filter((c) => c.videoProvenance === "AUTHENTIC").length
      },
      incidents: townCases
        .slice()
        .sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? ""))
        .map(toIncident)
    };
  });
}

export async function getTown(slug: string): Promise<Town | null> {
  const towns = await allTowns();
  return towns.find((t) => t.slug === slug) ?? null;
}

export async function allTownSlugs(): Promise<string[]> {
  return (await allTowns()).map((t) => t.slug);
}
