package com.viralcrime.api.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * A proposed change awaiting human review. Created by the monitor pipeline;
 * applied to a case ONLY when an editor approves it.
 */
@Entity
@Table(name = "case_drafts")
public class CaseDraft {

    @Id @GeneratedValue
    private UUID id;

    // Nullable: a NEW_CASE draft has no case yet — that's what approving it creates.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private CrimeCase crimeCase;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private DraftKind kind;

    @Enumerated(EnumType.STRING) @Column(name = "proposed_legal_status")
    private LegalStatus proposedLegalStatus;

    @Column(name = "proposed_disposition", columnDefinition = "text")
    private String proposedDisposition;

    @Column(nullable = false, columnDefinition = "text")
    private String detail;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    // NEW_CASE proposal fields — only populated when kind == NEW_CASE.
    @Column(name = "proposed_slug", length = 200)
    private String proposedSlug;

    @Column(name = "proposed_headline", length = 300)
    private String proposedHeadline;

    @Column(name = "proposed_event_type", length = 80)
    private String proposedEventType;

    @Column(name = "proposed_jurisdiction_city", length = 120)
    private String proposedJurisdictionCity;

    @Column(name = "proposed_jurisdiction_state", length = 2)
    private String proposedJurisdictionState;

    @Column(name = "proposed_embed_url", length = 1000)
    private String proposedEmbedUrl;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private DraftStatus status = DraftStatus.PENDING;

    @Column(name = "created_by", nullable = false)
    private String createdBy = "monitor";

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    protected CaseDraft() { }

    public CaseDraft(CrimeCase c, DraftKind kind, String detail) {
        this.crimeCase = c;
        this.kind = kind;
        this.detail = detail;
    }

    /** NEW_CASE drafts propose a case that doesn't exist yet — no CrimeCase to attach to. */
    public CaseDraft(DraftKind kind, String detail) {
        this.kind = kind;
        this.detail = detail;
    }

    public UUID getId() { return id; }
    public CrimeCase getCrimeCase() { return crimeCase; }
    public DraftKind getKind() { return kind; }
    public LegalStatus getProposedLegalStatus() { return proposedLegalStatus; }
    public void setProposedLegalStatus(LegalStatus s) { this.proposedLegalStatus = s; }
    public String getProposedDisposition() { return proposedDisposition; }
    public void setProposedDisposition(String d) { this.proposedDisposition = d; }
    public String getDetail() { return detail; }
    public String getSourceUrl() { return sourceUrl; }
    public void setSourceUrl(String u) { this.sourceUrl = u; }
    public DraftStatus getStatus() { return status; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String c) { this.createdBy = c; }
    public String getReviewedBy() { return reviewedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public String getProposedSlug() { return proposedSlug; }
    public void setProposedSlug(String s) { this.proposedSlug = s; }
    public String getProposedHeadline() { return proposedHeadline; }
    public void setProposedHeadline(String h) { this.proposedHeadline = h; }
    public String getProposedEventType() { return proposedEventType; }
    public void setProposedEventType(String e) { this.proposedEventType = e; }
    public String getProposedJurisdictionCity() { return proposedJurisdictionCity; }
    public void setProposedJurisdictionCity(String c) { this.proposedJurisdictionCity = c; }
    public String getProposedJurisdictionState() { return proposedJurisdictionState; }
    public void setProposedJurisdictionState(String s) { this.proposedJurisdictionState = s; }
    public String getProposedEmbedUrl() { return proposedEmbedUrl; }
    public void setProposedEmbedUrl(String u) { this.proposedEmbedUrl = u; }

    public void markApproved(String reviewer) {
        this.status = DraftStatus.APPROVED; this.reviewedBy = reviewer; this.reviewedAt = Instant.now();
    }
    public void markRejected(String reviewer) {
        this.status = DraftStatus.REJECTED; this.reviewedBy = reviewer; this.reviewedAt = Instant.now();
    }
}
