package com.viralcrime.api.web;

import com.viralcrime.api.domain.*;
import com.viralcrime.api.service.NamingGateService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Read API over cases. The naming gate is applied at this serialization
 * boundary: an individual who fails the gate is simply absent from the DTO,
 * so an ungated name can never leave the service.
 */
@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CrimeCaseRepository repo;
    private final NamingGateService gate;

    public CaseController(CrimeCaseRepository repo, NamingGateService gate) {
        this.repo = repo;
        this.gate = gate;
    }

    private static final List<CaseState> PUBLIC_STATES = List.of(
        CaseState.PUBLISHED_OPEN, CaseState.MONITORING, CaseState.RESOLVED, CaseState.CORRECTED
    );

    @GetMapping("/{slug}")
    @Transactional(readOnly = true)
    public ResponseEntity<CaseDto> getBySlug(@PathVariable String slug) {
        return repo.findBySlug(slug)
            .map(this::toDto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Homepage / index grid: published cases only, newest incident first.
    @GetMapping
    @Transactional(readOnly = true)
    public List<CaseSummaryDto> list() {
        return repo.findByStateInOrderByIncidentDateDesc(PUBLIC_STATES).stream()
            .map(c -> new CaseSummaryDto(
                c.getSlug(),
                c.getHeadline(),
                c.getEventType(),
                c.getJurisdictionCity(),
                c.getJurisdictionState(),
                c.getState().name(),
                c.getIncidentDate(),
                c.getEmbedRefs()
            ))
            .toList();
    }

    private CaseDto toDto(CrimeCase c) {
        List<String> names = c.getNamedIndividuals().stream()
            .filter(n -> gate.isNameable(n, c))          // gate enforced here
            .map(NamedIndividual::getFullName)
            .toList();

        List<CaseDto.SourceDto> sources = c.getSources().stream()
            .map(s -> new CaseDto.SourceDto(s.getSourceType().name(), s.getUrl(), null))
            .toList();

        List<CaseDto.ClaimReviewDto> reviews = c.getClaimReviews().stream()
            .map(r -> new CaseDto.ClaimReviewDto(r.getClaimReviewed(), r.getRatingValue(), r.getRatingName()))
            .toList();

        Integer rating = c.getVideoProvenance() == VideoProvenance.UNVERIFIED
            ? null : c.getVideoProvenance().ratingValue();

        return new CaseDto(
            c.getSlug(),
            c.getHeadline(),
            c.getEventType(),
            c.getSummary(),
            c.getJurisdictionCity(),
            c.getJurisdictionCounty(),
            c.getJurisdictionState(),
            c.getIncidentDate(),
            c.getLocationBlock(),
            c.getState().name(),
            c.getLegalStatus().name(),
            c.getDisposition(),
            c.getVideoProvenance().name(),
            rating,
            c.getVideoNotes(),
            c.getEmbedRefs(),
            sources,
            reviews,
            names,
            c.getLastVerifiedAt()
        );
    }
}
