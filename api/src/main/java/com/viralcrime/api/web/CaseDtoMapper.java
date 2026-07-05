package com.viralcrime.api.web;

import com.viralcrime.api.domain.*;
import com.viralcrime.api.service.NamingGateService;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Shared CrimeCase -> CaseDto mapping, used by both the public read API and
 * the admin API. The naming gate is applied here — an individual who fails
 * it is simply absent from the DTO, so an ungated name can never leave the
 * service, regardless of which controller is asking.
 */
@Component
public class CaseDtoMapper {

    private final NamingGateService gate;

    public CaseDtoMapper(NamingGateService gate) {
        this.gate = gate;
    }

    public CaseDto toDto(CrimeCase c) {
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
            c.getTags(),
            sources,
            reviews,
            names,
            c.getLastVerifiedAt()
        );
    }

    public CaseSummaryDto toSummaryDto(CrimeCase c) {
        return new CaseSummaryDto(
            c.getSlug(),
            c.getHeadline(),
            c.getEventType(),
            c.getJurisdictionCity(),
            c.getJurisdictionCounty(),
            c.getJurisdictionState(),
            c.getLocationBlock(),
            c.getState().name(),
            c.getIncidentDate(),
            c.getVideoProvenance().name(),
            c.getEmbedRefs(),
            c.getTags()
        );
    }
}
