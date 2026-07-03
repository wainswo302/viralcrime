package com.viralcrime.api.web;

import java.time.LocalDate;
import java.util.List;

/** Lightweight case shape for grid/list views (homepage, town hubs). */
public record CaseSummaryDto(
    String slug,
    String headline,
    String eventType,
    String jurisdictionCity,
    String jurisdictionState,
    String state,
    LocalDate incidentDate,
    List<String> embedRefs
) { }
