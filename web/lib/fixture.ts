import type { CaseDto } from "./types";

// A demo case so the page renders before the backend is wired up.
// Mirrors the mockup: authentic video, misattributed location, charges filed.
export const FIXTURE: Record<string, CaseDto> = {
  "2026-06-11-broad-st-altercation": {
    slug: "2026-06-11-broad-st-altercation",
    headline: "Fan altercation during NBA Finals watch event — Philadelphia, PA",
    eventType: "assault",
    summary:
      "Police responded to a reported altercation between attendees at a public NBA Finals watch event on the 3600 block of South Broad Street. Footage circulating on social media was verified as authentic, though widely-shared posts misidentified the venue. Charges have been filed; the matter has not yet been adjudicated.",
    jurisdictionCity: "Philadelphia",
    jurisdictionCounty: "Philadelphia",
    jurisdictionState: "PA",
    incidentDate: "2026-06-11",
    locationBlock: "3600 block of S. Broad St",
    state: "PUBLISHED_OPEN",
    legalStatus: "CHARGED",
    disposition: null,
    videoProvenance: "AUTHENTIC",
    videoRatingValue: 5,
    videoNotes: "Confirmed via source contact, geolocation, and metadata review.",
    embedRefs: [],
    sources: [
      { type: "OFFICIAL_RECORD", url: "https://example.gov/docket/2026-0611", label: "Municipal court docket" },
      { type: "MAINSTREAM_COVERAGE", url: "https://example.com/news/watch-party", label: "Local news coverage" }
    ],
    claimReviews: [
      {
        claimReviewed: "A viral video shows fans assaulting rival fans inside the arena on June 10, 2026.",
        ratingValue: 3,
        ratingName: "Mostly true — authentic footage, misattributed location"
      }
    ],
    namedIndividuals: [],
    lastVerifiedAt: "2026-06-13T14:00:00Z"
  },
  "2026-04-02-markley-st-retail-theft": {
    slug: "2026-04-02-markley-st-retail-theft",
    headline: "Retail theft case on Markley Street resolved in court — Norristown, PA",
    eventType: "retail_theft",
    summary:
      "A retail theft reported on the 400 block of Markley Street was resolved in Montgomery County court. The defendant entered a guilty plea.",
    jurisdictionCity: "Norristown",
    jurisdictionCounty: "Montgomery",
    jurisdictionState: "PA",
    incidentDate: "2026-04-02",
    locationBlock: "400 block of Markley St",
    state: "RESOLVED",
    legalStatus: "CONVICTED",
    disposition: "Pleaded guilty to retail theft; sentenced to 12 months probation.",
    videoProvenance: "MISCAPTIONED",
    videoRatingValue: 3,
    videoNotes: "Original clip authentic; a viral repost attached an unrelated location.",
    embedRefs: [],
    sources: [
      { type: "OFFICIAL_RECORD", url: "https://example.gov/mont/docket/2026-0402", label: "Montgomery County docket" },
      { type: "MAINSTREAM_COVERAGE", url: "https://example.com/news/markley-theft", label: "Local news coverage" }
    ],
    claimReviews: [
      { claimReviewed: "A viral clip shows the theft happening in Philadelphia.", ratingValue: 3, ratingName: "Misleading — real theft, wrong city attached" }
    ],
    namedIndividuals: ["Jordan Blake"],
    lastVerifiedAt: "2026-05-05T16:30:00Z"
  }
};
