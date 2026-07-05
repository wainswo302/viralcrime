package com.viralcrime.api.web;

import com.viralcrime.api.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Read API over cases. The naming gate is applied at the DTO-mapping
 * boundary (CaseDtoMapper): an individual who fails the gate is simply
 * absent from the DTO, so an ungated name can never leave the service.
 */
@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CrimeCaseRepository repo;
    private final CaseDtoMapper mapper;

    public CaseController(CrimeCaseRepository repo, CaseDtoMapper mapper) {
        this.repo = repo;
        this.mapper = mapper;
    }

    private static final List<CaseState> PUBLIC_STATES = List.of(
        CaseState.PUBLISHED_OPEN, CaseState.MONITORING, CaseState.RESOLVED, CaseState.CORRECTED
    );

    @GetMapping("/{slug}")
    @Transactional(readOnly = true)
    public ResponseEntity<CaseDto> getBySlug(@PathVariable String slug) {
        return repo.findBySlug(slug)
            .map(mapper::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Homepage / index grid: published cases only, newest incident first.
    @GetMapping
    @Transactional(readOnly = true)
    public List<CaseSummaryDto> list() {
        return repo.findByStateInOrderByIncidentDateDesc(PUBLIC_STATES).stream()
            .map(mapper::toSummaryDto)
            .toList();
    }
}
