# Single-Town SEO Cluster — Worked Example

**Example town: Norristown, PA** (Montgomery County — real PD, real public records, Philadelphia long-tail). Swap the town name and you have your template.

The whole strategy in one sentence: **publish hundreds of specific, low-competition pages that each catch a trickle of intent traffic, all linked up under one town hub so authority concentrates.** You are not chasing the viral flood. You are owning the long tail no national outlet bothers with.

---

## 1. The cluster shape

One **hub** (the town), many **spokes** (incidents, blotter periods, location pages). Internal links all point inward to the hub and laterally between related spokes. This is what tells Google "this site is the authority on Norristown public safety," which is the only way a zero-authority domain climbs in a YMYL niche.

```
                    [ HUB: Norristown Crime & Safety ]
                                  |
        -------------------------------------------------------
        |                |                 |                  |
 [Blotter: Jun 2026] [W. Marshall St] [Incident pages]  [Safety guides]
        |                |                 |                  |
  daily/weekly      location pages    one per event      evergreen
  roundup pages     (street/area)     (already-public)   (parking, stats)
```

### Three spoke types, by intent

| Spoke type | Example query it catches | Competition | Why you can win it |
|---|---|---|---|
| **Blotter period** | `norristown police blotter june 2026` | Very low | Nobody systematically publishes these anymore |
| **Location** | `crime on west marshall street norristown` | Near zero | Hyper-specific; only you have the structured data |
| **Incident** | `norristown [public event already in the news]` | Low–medium | You add the local detail + records context outlets skip |

The viral head term (`knicks fans brawl spurs`) is deliberately **absent** — that's the flood you can't win. Everything here is the trickle you can.

---

## 2. The HUB page

**URL:** `/pa/montgomery/norristown/`
**Title tag:** `Norristown, PA Crime & Public Safety Records | [SiteName]`
**H1:** `Norristown Crime & Safety`

**What's on it:**
- Short intro paragraph (what this page tracks, where data comes from, update cadence)
- Latest blotter roundup (links to the period spokes)
- A simple map or list of location pages
- Links to evergreen safety/stats guides
- A visible "How we source and handle names" link → your policy page (this is a trust signal *and* legal cover)

The hub is mostly a **router** — its job is to link to spokes and accumulate the internal-link equity they send back. Keep it lean and keep it updated, because freshness on the hub signals an active section.

---

## 3. The INCIDENT page template

This is the unit you'll mass-produce from your Pillar 2 pipeline. The template *bakes in* the liability rules so safe handling is the default, not an afterthought.

```
URL:    /pa/montgomery/norristown/[yyyy-mm-dd]-[short-event-slug]/
Title:  [Event description, no private names] — Norristown, PA
H1:     [Same, human-readable]

[ Dateline: Norristown, PA · [date] · Source: [Montgomery County / NPD record] ]

PARAGRAPH 1 — What happened, factual, event-framed.
   "Police responded to a reported [incident type] on the [block] of
    [street] on [date], according to [official source]."

PARAGRAPH 2 — Sourcing & status.
   Link to the official record. State the current legal status plainly
   ("charges filed," "no arrest reported," "under investigation").

[ EMBED BLOCK — only if a public post exists and only via the
  platform's native embed code. Never a rehosted video file. ]

PARAGRAPH 3 — Local context.
   Prior incidents on this street (link to the location spoke),
   relevant stats (link to the stats guide). This is the value
   national coverage never adds.

[ Byline + "Corrections: email ___" + last-updated timestamp ]
```

### The name-handling rules, written into the template

These are non-negotiable and they double as your defamation/liability shield:

1. **Private individuals: do not name in title, H1, URL, or as the page subject.** Describe the event. A name may appear *only* if it's already in the official charging record AND in mainstream coverage — and even then, never as the page's SEO target.
2. **Always state legal status** and update it. "Charged" is not "guilty." Build a process to revisit pages when cases resolve or charges drop.
3. **One sourced link per claim.** If you can't link an official record, you don't publish the claim.
4. **Embeds, never rehosts.** Native embed code only. If the poster deletes it, it vanishes from your page — that's the feature, not a bug.
5. **Visible corrections path.** A real email, real responsiveness. This is the cheapest insurance you'll ever buy.

If a page can't be built within these rules, that's the signal it's a page you shouldn't build.

---

## 4. Schema markup (JSON-LD)

Drop this in the `<head>`. Use `NewsArticle` for incident/blotter pages. It tells Google what the page is and feeds E-E-A-T signals (author, publisher, dates) that matter doubly in a YMYL niche.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Police respond to reported burglary on W. Marshall St — Norristown, PA",
  "datePublished": "2026-06-11T09:00:00-04:00",
  "dateModified": "2026-06-11T09:00:00-04:00",
  "author": {
    "@type": "Person",
    "name": "[Real byline]",
    "url": "https://[site]/about/[author]/"
  },
  "publisher": {
    "@type": "Organization",
    "name": "[SiteName]",
    "logo": {
      "@type": "ImageObject",
      "url": "https://[site]/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://[site]/pa/montgomery/norristown/2026-06-11-marshall-st-burglary/"
  },
  "isAccessibleForFree": true,
  "spatialCoverage": {
    "@type": "Place",
    "name": "Norristown, Pennsylvania",
    "geo": { "@type": "GeoCoordinates", "latitude": 40.1215, "longitude": -75.3399 }
  }
}
</script>
```

For the **hub**, use `CollectionPage` + `BreadcrumbList`. For evergreen **safety guides**, use `Article` or `FAQPage` if it's Q&A-shaped. Validate every template once with Google's Rich Results Test before you mass-produce — get the template right, then scale it.

> Note: there's a `LocalNewsArticle` type floating around in older guidance. `NewsArticle` is the safe, well-supported choice; don't over-engineer the type.

---

## 5. Free tools to validate terms & ship clean

You do **not** need paid Ahrefs/Semrush to start. Free stack:

| Job | Free tool |
|---|---|
| See real queries you already rank for | **Google Search Console** (essential — install day one) |
| Volume + difficulty sense-check | **Keywords Everywhere** (cheap credits) / **Google Keyword Planner** |
| Find long-tail phrasings real people use | **Google autocomplete**, **"People also ask"**, **AnswerThePublic** (free tier) |
| Validate schema | **Google Rich Results Test**, **Schema.org validator** |
| Indexing & sitemap | **Search Console** → submit sitemap, request indexing |
| See what currently ranks (your real competition) | Just **search the query** in an incognito window |

The single highest-value habit: after publishing, watch Search Console for the queries you *start* to rank for on page 2–3, then strengthen those pages. The data tells you which trickles are real. Chase those.

---

## 6. First-slice build order

1. Stand up the **hub** for one town (Norristown).
2. Ship **one location page** (`/west-marshall-street/`) and **one blotter-period page** by hand — these are your templates.
3. Wire the **schema** and validate both templates.
4. Submit the sitemap to Search Console.
5. Only now point your Pillar 2 pipeline at the incident-page template and start scaling — with the name-handling rules enforced *in the template*, so every generated page is safe by construction.
6. Watch Search Console for 4–6 weeks. Double down on what ranks. Then add town #2.

Prove the trickle compounds on one town before you generalize. If it works for Norristown, the same template is a town-stamping machine — and *that* repeatability is the actual asset, not any single page.
