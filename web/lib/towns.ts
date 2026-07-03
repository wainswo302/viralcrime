export interface TownIncident { slug: string; title: string; meta: string; resolved?: boolean; }
export interface Town {
  slug: string; city: string; county: string; state: string;
  blurb: string;
  stats: { tracked: number; resolved: number; verified: number };
  incidents: TownIncident[];
}

export const TOWNS: Record<string, Town> = {
  "norristown-pa": {
    slug: "norristown-pa", city: "Norristown", county: "Montgomery", state: "PA",
    blurb: "Incident records sourced from official Montgomery County and Norristown PD releases. Names are handled under our disclosure policy. Updated weekly.",
    stats: { tracked: 312, resolved: 47, verified: 29 },
    incidents: [
      { slug: "2026-04-02-markley-st-retail-theft", title: "Retail theft on Markley Street", meta: "Apr 2 · resolved", resolved: true }
    ]
  },
  "philadelphia-pa": {
    slug: "philadelphia-pa", city: "Philadelphia", county: "Philadelphia", state: "PA",
    blurb: "Incidents sourced from official Philadelphia court and police records, tracked through to verified resolution and video authenticity status.",
    stats: { tracked: 1041, resolved: 88, verified: 63 },
    incidents: [
      { slug: "2026-06-11-broad-st-altercation", title: "Fan altercation during NBA Finals watch event", meta: "Jun 11 · charges filed" }
    ]
  }
};

export function allTownSlugs(): string[] { return Object.keys(TOWNS); }
