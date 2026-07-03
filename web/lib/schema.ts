import type { CaseDto } from "./types";

const SITE = process.env.SITE_URL ?? "https://viralcrime.example";
const ORG = "ViralCrime";

function caseUrl(slug: string): string {
  return `${SITE}/cases/${slug}`;
}

/**
 * Schema.org NewsArticle for the case page. Feeds Google's article
 * understanding and the E-E-A-T signals (author, publisher, dates) that
 * matter doubly in a YMYL niche.
 */
export function buildNewsArticle(c: CaseDto) {
  const published = c.incidentDate ? `${c.incidentDate}T09:00:00-04:00` : undefined;
  const modified = c.lastVerifiedAt ?? published;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: c.headline,
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    author: { "@type": "Organization", name: ORG, url: SITE },
    publisher: {
      "@type": "Organization",
      name: ORG,
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": caseUrl(c.slug) },
    isAccessibleForFree: true,
    ...(c.summary ? { description: c.summary } : {}),
    spatialCoverage: {
      "@type": "Place",
      name: [c.jurisdictionCity, c.jurisdictionState].filter(Boolean).join(", ")
    }
  };
}

/**
 * One Schema.org ClaimReview per adjudicated viral claim. This is the
 * machine-readable fact-check layer — the direct on-ramp to AI answers and
 * Google's fact-check surfaces.
 */
export function buildClaimReviews(c: CaseDto) {
  return c.claimReviews.map((r) => ({
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: caseUrl(c.slug),
    claimReviewed: r.claimReviewed,
    itemReviewed: { "@type": "Claim" },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.ratingValue,
      bestRating: 5,
      worstRating: 1,
      alternateName: r.ratingName
    },
    author: { "@type": "Organization", name: ORG, url: SITE },
    ...(c.lastVerifiedAt ? { datePublished: c.lastVerifiedAt.slice(0, 10) } : {})
  }));
}

/** All JSON-LD blocks for a case, ready to serialize into <script> tags. */
export function buildAllJsonLd(c: CaseDto): object[] {
  return [buildNewsArticle(c), ...buildClaimReviews(c)];
}
