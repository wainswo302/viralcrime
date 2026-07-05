package com.viralcrime.api.web;

import java.time.LocalDate;
import java.util.List;

/** Lightweight case shape for grid/list views (homepage, town hubs). */
public record CaseSummaryDto(
    String slug,
    String headline,
    String eventType,
    String jurisdictionCity,
    String jurisdictionCounty,
    String jurisdictionState,
    String locationBlock,
    String state,
    LocalDate incidentDate,
    String videoProvenance,
    List<String> embedRefs,
    List<String> tags
) { }
