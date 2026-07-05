package com.viralcrime.api.web;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Public read model for a case. This is the API contract the frontend types
 * mirror. Named individuals are already gate-filtered before they reach here.
 */
public record CaseDto(
    String slug,
    String headline,
    String eventType,
    String summary,
    String jurisdictionCity,
    String jurisdictionCounty,
    String jurisdictionState,
    LocalDate incidentDate,
    String locationBlock,
    String state,
    String legalStatus,
    String disposition,
    String videoProvenance,
    Integer videoRatingValue,
    String videoNotes,
    List<String> embedRefs,
    List<String> tags,
    List<SourceDto> sources,
    List<ClaimReviewDto> claimReviews,
    List<String> namedIndividuals,
    Instant lastVerifiedAt
) {
    public record SourceDto(String type, String url, String label) { }
    public record ClaimReviewDto(String claimReviewed, int ratingValue, String ratingName) { }
}
