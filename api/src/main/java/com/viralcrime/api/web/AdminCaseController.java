package com.viralcrime.api.web;

import com.viralcrime.api.domain.*;
import com.viralcrime.api.service.CaseLifecycleService;
import com.viralcrime.api.service.InvalidTransitionException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Admin-only case editing — for the "special cases need manual edits" path.
 * Everything here requires the admin credential (see SecurityConfig). Unlike
 * the draft queue, this writes directly: you're already the authenticated
 * human, so there's no second gate to pass.
 */
@RestController
@RequestMapping("/api/admin/cases")
public class AdminCaseController {

    private final CrimeCaseRepository repo;
    private final CaseDtoMapper mapper;
    private final CaseLifecycleService lifecycle;

    public AdminCaseController(CrimeCaseRepository repo, CaseDtoMapper mapper, CaseLifecycleService lifecycle) {
        this.repo = repo;
        this.mapper = mapper;
        this.lifecycle = lifecycle;
    }

    // Every case, any state — the public list only shows PUBLISHED_OPEN/MONITORING/RESOLVED/CORRECTED.
    @GetMapping
    @Transactional(readOnly = true)
    public List<CaseSummaryDto> listAll() {
        return repo.findAll().stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .map(mapper::toSummaryDto)
            .toList();
    }

    public record CaseEditRequest(
        @NotBlank String headline,
        String summary,
        @NotBlank String eventType,
        @NotBlank String jurisdictionCity,
        String jurisdictionCounty,
        @NotBlank String jurisdictionState,
        LocalDate incidentDate,
        String locationBlock,
        @NotBlank String videoProvenance,
        String videoNotes,
        @NotBlank String legalStatus,
        String disposition,
        boolean monitoringActive,
        List<String> tags
    ) { }

    @PutMapping("/{slug}")
    @Transactional
    public ResponseEntity<CaseDto> update(@PathVariable String slug, @Valid @RequestBody CaseEditRequest body) {
        CrimeCase c = repo.findBySlug(slug).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();

        c.setHeadline(body.headline());
        c.setSummary(body.summary());
        c.setJurisdictionCounty(body.jurisdictionCounty());
        c.setIncidentDate(body.incidentDate());
        c.setLocationBlock(body.locationBlock());
        c.setVideoProvenance(VideoProvenance.valueOf(body.videoProvenance()));
        c.setVideoNotes(body.videoNotes());
        c.setLegalStatus(LegalStatus.valueOf(body.legalStatus()));
        c.setDisposition(body.disposition());
        c.setMonitoringActive(body.monitoringActive());
        c.setTags(body.tags() != null ? body.tags() : List.of());
        // eventType/jurisdictionCity/jurisdictionState are set at creation and
        // deliberately not editable here — changing them reslugs nothing, so a
        // real correction to those belongs in a new case, not a silent field edit.

        repo.save(c);
        return ResponseEntity.ok(mapper.toDto(c));
    }

    public record TransitionRequest(@NotBlank String targetState) { }

    @PostMapping("/{slug}/transition")
    @Transactional
    public ResponseEntity<?> transition(@PathVariable String slug, @Valid @RequestBody TransitionRequest body) {
        CrimeCase c = repo.findBySlug(slug).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();
        try {
            lifecycle.transition(c, CaseState.valueOf(body.targetState()));
        } catch (InvalidTransitionException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        repo.save(c);
        return ResponseEntity.ok(mapper.toDto(c));
    }

    public record AddEmbedRequest(@NotBlank String url) { }

    @PostMapping("/{slug}/embed")
    @Transactional
    public ResponseEntity<CaseDto> addEmbed(@PathVariable String slug, @Valid @RequestBody AddEmbedRequest body) {
        CrimeCase c = repo.findBySlug(slug).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();
        c.addEmbedRef(body.url());
        repo.save(c);
        return ResponseEntity.ok(mapper.toDto(c));
    }
}
