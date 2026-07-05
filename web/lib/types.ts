// Mirrors com.viralcrime.api.web.CaseDto — the API contract.

export interface SourceDto {
  type: "OFFICIAL_RECORD" | "MAINSTREAM_COVERAGE" | "OTHER";
  url: string;
  label: string | null;
}

export interface ClaimReviewDto {
  claimReviewed: string;
  ratingValue: number; // 1..5
  ratingName: string;
}

// Mirrors com.viralcrime.api.web.CaseSummaryDto — the homepage/index grid shape.
export interface CaseSummaryDto {
  slug: string;
  headline: string;
  eventType: string;
  jurisdictionCity: string;
  jurisdictionCounty: string | null;
  jurisdictionState: string;
  state: string;
  incidentDate: string | null;
  videoProvenance: string;
  embedRefs: string[];
}

export interface CaseDto {
  slug: string;
  headline: string;
  eventType: string;
  summary: string | null;
  jurisdictionCity: string;
  jurisdictionCounty: string | null;
  jurisdictionState: string;
  incidentDate: string | null; // ISO date
  locationBlock: string | null;
  state: string;
  legalStatus: string;
  disposition: string | null;
  videoProvenance:
    | "AUTHENTIC" | "MISCAPTIONED" | "RECIRCULATED"
    | "STAGED" | "AI_GENERATED" | "UNVERIFIED";
  videoRatingValue: number | null;
  videoNotes: string | null;
  embedRefs: string[];
  sources: SourceDto[];
  claimReviews: ClaimReviewDto[];
  namedIndividuals: string[]; // already gate-filtered server-side
  lastVerifiedAt: string | null; // ISO datetime
}
