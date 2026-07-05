import type { CaseSummaryDto } from "./types";
import { listCases } from "./api";
import { formatDate } from "./status";

export interface TownIncident { slug: string; title: string; meta: string; resolved?: boolean; }
export interface LocationLink { slug: string; street: string; count: number; }
export interface BlotterLink { period: string; label: string; count: number; }
export interface Town {
  slug: string; city: string; county: string | null; state: string;
  blurb: string;
  stats: { tracked: number; resolved: number; verified: number };
  incidents: TownIncident[];
  locations: LocationLink[];
  blotterPeriods: BlotterLink[];
}
export interface LocationSpoke {
  townSlug: string; street: string; city: string; state: string;
  incidents: TownIncident[];
}
export interface BlotterPeriod {
  townSlug: string; period: string; label: string; city: string; state: string;
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

// "400 block of Markley St" -> "Markley St". Falls back to the raw block
// string when it doesn't match the expected "<number> block of <street>" shape.
function streetFromLocationBlock(block: string): string {
  const m = block.match(/^\d+\s+block\s+of\s+(.+)$/i);
  return (m ? m[1] : block).trim();
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** Groups a town's cases by street, keyed by street slug. */
function groupByStreet(townCases: CaseSummaryDto[]): Map<string, { street: string; cases: CaseSummaryDto[] }> {
  const byStreet = new Map<string, { street: string; cases: CaseSummaryDto[] }>();
  for (const c of townCases) {
    if (!c.locationBlock) continue;
    const street = streetFromLocationBlock(c.locationBlock);
    const slug = slugify(street);
    if (!byStreet.has(slug)) byStreet.set(slug, { street, cases: [] });
    byStreet.get(slug)!.cases.push(c);
  }
  return byStreet;
}

// "2026-06-11" -> "2026-06"
function periodKey(iso: string): string {
  return iso.slice(0, 7);
}

// "2026-06" -> "June 2026"
function periodLabel(period: string): string {
  const [year, month] = period.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Groups a town's cases by incident month, keyed by "YYYY-MM". */
function groupByPeriod(townCases: CaseSummaryDto[]): Map<string, CaseSummaryDto[]> {
  const byPeriod = new Map<string, CaseSummaryDto[]>();
  for (const c of townCases) {
    if (!c.incidentDate) continue;
    const key = periodKey(c.incidentDate);
    if (!byPeriod.has(key)) byPeriod.set(key, []);
    byPeriod.get(key)!.push(c);
  }
  return byPeriod;
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
    const locations = Array.from(groupByStreet(townCases).entries())
      .map(([streetSlug, g]) => ({ slug: streetSlug, street: g.street, count: g.cases.length }))
      .sort((a, b) => b.count - a.count);
    const blotterPeriods = Array.from(groupByPeriod(townCases).entries())
      .map(([period, periodCases]) => ({ period, label: periodLabel(period), count: periodCases.length }))
      .sort((a, b) => b.period.localeCompare(a.period));

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
        .map(toIncident),
      locations,
      blotterPeriods
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

async function getTownCases(townSlugParam: string): Promise<CaseSummaryDto[]> {
  const cases = await listCases();
  return cases.filter(
    (c) => c.jurisdictionCity && c.jurisdictionState && townSlug(c.jurisdictionCity, c.jurisdictionState) === townSlugParam
  );
}

/** One location spoke — all cases on a given street within a town. */
export async function getLocationSpoke(townSlugParam: string, streetSlug: string): Promise<LocationSpoke | null> {
  const townCases = await getTownCases(townSlugParam);
  const street = groupByStreet(townCases).get(streetSlug);
  if (!street || townCases.length === 0) return null;

  const first = townCases[0];
  return {
    townSlug: townSlugParam,
    street: street.street,
    city: first.jurisdictionCity,
    state: first.jurisdictionState,
    incidents: street.cases
      .slice()
      .sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? ""))
      .map(toIncident)
  };
}

/** Every {town slug, street slug} pair — for static params and the sitemap. */
export async function allLocationParams(): Promise<{ slug: string; street: string }[]> {
  const towns = await allTowns();
  return towns.flatMap((t) => t.locations.map((l) => ({ slug: t.slug, street: l.slug })));
}

/** One blotter-period spoke — all cases surfaced in a given month within a town. */
export async function getBlotterPeriod(townSlugParam: string, period: string): Promise<BlotterPeriod | null> {
  const townCases = await getTownCases(townSlugParam);
  const periodCases = groupByPeriod(townCases).get(period);
  if (!periodCases || townCases.length === 0) return null;

  const first = townCases[0];
  return {
    townSlug: townSlugParam,
    period,
    label: periodLabel(period),
    city: first.jurisdictionCity,
    state: first.jurisdictionState,
    incidents: periodCases
      .slice()
      .sort((a, b) => (b.incidentDate ?? "").localeCompare(a.incidentDate ?? ""))
      .map(toIncident)
  };
}

/** Every {town slug, period} pair — for static params and the sitemap. */
export async function allBlotterParams(): Promise<{ slug: string; period: string }[]> {
  const towns = await allTowns();
  return towns.flatMap((t) => t.blotterPeriods.map((b) => ({ slug: t.slug, period: b.period })));
}
