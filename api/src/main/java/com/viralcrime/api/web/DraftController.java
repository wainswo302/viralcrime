package com.viralcrime.api.web;

import com.viralcrime.api.domain.*;
import com.viralcrime.api.service.DraftService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/** Pipeline submits drafts here; editors review them here. */
@RestController
@RequestMapping("/api")
public class DraftController {

    private final CrimeCaseRepository cases;
    private final CaseDraftRepository drafts;
    private final DraftService draftService;

    public DraftController(CrimeCaseRepository cases, CaseDraftRepository drafts, DraftService draftService) {
        this.cases = cases;
        this.drafts = drafts;
        this.draftService = draftService;
    }

    public record SubmitDraft(
        @NotBlank String kind,
        String proposedLegalStatus,
        String proposedDisposition,
        @NotBlank String detail,
        String sourceUrl,
        String createdBy
    ) { }

    public record ReviewAction(@NotBlank String reviewer) { }

    public record SubmitNewCaseDraft(
        @NotBlank String headline,
        @NotBlank String eventType,
        @NotBlank String jurisdictionCity,
        @NotBlank String jurisdictionState,
        LocalDate incidentDate,
        @NotBlank String videoUrl,
        String createdBy
    ) { }

    private static final Pattern NON_SLUG_CHARS = Pattern.compile("[^a-z0-9]+");

    // You -> propose a brand-new case from a video link (always lands as PENDING)
    @PostMapping("/drafts/new-case")
    public ResponseEntity<DraftDto> submitNewCase(@RequestBody SubmitNewCaseDraft body) {
        LocalDate date = body.incidentDate() != null ? body.incidentDate() : LocalDate.now();
        String headlineSlug = NON_SLUG_CHARS.matcher(body.headline().toLowerCase(Locale.ROOT))
            .replaceAll("-").replaceAll("^-+|-+$", "");
        if (headlineSlug.length() > 60) headlineSlug = headlineSlug.substring(0, 60).replaceAll("-+$", "");
        String slug = date + "-" + headlineSlug;

        CaseDraft d = new CaseDraft(DraftKind.NEW_CASE, "Manually submitted: " + body.headline());
        d.setProposedSlug(slug);
        d.setProposedHeadline(body.headline());
        d.setProposedEventType(body.eventType());
        d.setProposedJurisdictionCity(body.jurisdictionCity());
        d.setProposedJurisdictionState(body.jurisdictionState());
        d.setProposedEmbedUrl(body.videoUrl());
        d.setSourceUrl(body.videoUrl());
        if (body.createdBy() != null) d.setCreatedBy(body.createdBy());
        return ResponseEntity.ok(DraftDto.of(drafts.save(d)));
    }

    // Pipeline -> propose a change (always lands as PENDING)
    @PostMapping("/cases/{slug}/drafts")
    public ResponseEntity<DraftDto> submit(@PathVariable String slug, @RequestBody SubmitDraft body) {
        CrimeCase c = cases.findBySlug(slug).orElse(null);
        if (c == null) return ResponseEntity.notFound().build();

        CaseDraft d = new CaseDraft(c, DraftKind.valueOf(body.kind()), body.detail());
        if (body.proposedLegalStatus() != null) d.setProposedLegalStatus(LegalStatus.valueOf(body.proposedLegalStatus()));
        d.setProposedDisposition(body.proposedDisposition());
        d.setSourceUrl(body.sourceUrl());
        if (body.createdBy() != null) d.setCreatedBy(body.createdBy());
        return ResponseEntity.ok(DraftDto.of(drafts.save(d)));
    }

    // Editor -> review queue
    @GetMapping("/drafts")
    @Transactional(readOnly = true)
    public List<DraftDto> pending() {
        return drafts.findByStatusOrderByCreatedAtAsc(DraftStatus.PENDING).stream().map(DraftDto::of).toList();
    }

    // Editor -> approve (applies via DraftService) or reject
    @PostMapping("/drafts/{id}/approve")
    @Transactional
    public ResponseEntity<DraftDto> approve(@PathVariable UUID id, @RequestBody ReviewAction body) {
        return drafts.findById(id)
            .map(d -> ResponseEntity.ok(DraftDto.of(draftService.approve(d, body.reviewer()))))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/drafts/{id}/reject")
    @Transactional
    public ResponseEntity<DraftDto> reject(@PathVariable UUID id, @RequestBody ReviewAction body) {
        return drafts.findById(id)
            .map(d -> ResponseEntity.ok(DraftDto.of(draftService.reject(d, body.reviewer()))))
            .orElse(ResponseEntity.notFound().build());
    }

    public record DraftDto(String id, String caseSlug, String kind, String status,
                           String proposedLegalStatus, String proposedDisposition,
                           String detail, String sourceUrl, String createdBy,
                           String proposedHeadline, String proposedEmbedUrl) {
        static DraftDto of(CaseDraft d) {
            return new DraftDto(
                d.getId().toString(),
                d.getCrimeCase() != null ? d.getCrimeCase().getSlug() : d.getProposedSlug(),
                d.getKind().name(),
                d.getStatus().name(),
                d.getProposedLegalStatus() == null ? null : d.getProposedLegalStatus().name(),
                d.getProposedDisposition(),
                d.getDetail(),
                d.getSourceUrl(),
                d.getCreatedBy(),
                d.getProposedHeadline(),
                d.getProposedEmbedUrl()
            );
        }
    }
}
