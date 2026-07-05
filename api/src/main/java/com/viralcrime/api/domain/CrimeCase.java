package com.viralcrime.api.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * A tracked incident/case. Named CrimeCase to avoid clashing with the SQL
 * keyword and the Java {@code case} keyword; the table is {@code crime_cases}.
 */
@Entity
@Table(name = "crime_cases")
public class CrimeCase {

    @Id @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(length = 300)
    private String headline;              // event-framed H1 / SEO title

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CaseState state = CaseState.SURFACED;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "jurisdiction_city", nullable = false)
    private String jurisdictionCity;

    @Column(name = "jurisdiction_county")
    private String jurisdictionCounty;

    @Column(name = "jurisdiction_state", nullable = false, length = 2)
    private String jurisdictionState;

    @Column(name = "incident_date")
    private LocalDate incidentDate;

    @Column(name = "location_block")
    private String locationBlock;

    @Column(columnDefinition = "text")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(name = "video_provenance", nullable = false)
    private VideoProvenance videoProvenance = VideoProvenance.UNVERIFIED;

    @Column(name = "video_notes", columnDefinition = "text")
    private String videoNotes;

    // Native embed URLs only — the platform serves the media, we never rehost it.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "embed_refs", nullable = false)
    private List<String> embedRefs = new ArrayList<>();

    // Free-form topic tags (e.g. "viral", "video-verified"). eventType stays
    // the authoritative single-value classification; these are supplementary.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", nullable = false)
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_status", nullable = false)
    private LegalStatus legalStatus = LegalStatus.NONE_REPORTED;

    @Column(columnDefinition = "text")
    private String disposition;

    @Column(name = "monitoring_active", nullable = false)
    private boolean monitoringActive = true;

    @OneToMany(mappedBy = "crimeCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Source> sources = new ArrayList<>();

    @OneToMany(mappedBy = "crimeCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NamedIndividual> namedIndividuals = new ArrayList<>();

    @OneToMany(mappedBy = "crimeCase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClaimReview> claimReviews = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "last_verified_at")
    private Instant lastVerifiedAt;

    protected CrimeCase() { }

    public CrimeCase(String slug, String eventType, String city, String state2) {
        this.slug = slug;
        this.eventType = eventType;
        this.jurisdictionCity = city;
        this.jurisdictionState = state2;
    }

    public UUID getId() { return id; }
    public String getSlug() { return slug; }
    public CaseState getState() { return state; }
    public void setState(CaseState state) { this.state = state; }
    public LegalStatus getLegalStatus() { return legalStatus; }
    public void setLegalStatus(LegalStatus s) { this.legalStatus = s; }
    public String getDisposition() { return disposition; }
    public void setDisposition(String d) { this.disposition = d; }
    public VideoProvenance getVideoProvenance() { return videoProvenance; }
    public void setVideoProvenance(VideoProvenance v) { this.videoProvenance = v; }
    public List<Source> getSources() { return sources; }
    public List<NamedIndividual> getNamedIndividuals() { return namedIndividuals; }
    public List<ClaimReview> getClaimReviews() { return claimReviews; }
    public boolean isMonitoringActive() { return monitoringActive; }
    public void setMonitoringActive(boolean m) { this.monitoringActive = m; }

    public String getHeadline() { return headline; }
    public void setHeadline(String h) { this.headline = h; }
    public String getEventType() { return eventType; }
    public String getJurisdictionCity() { return jurisdictionCity; }
    public String getJurisdictionCounty() { return jurisdictionCounty; }
    public void setJurisdictionCounty(String c) { this.jurisdictionCounty = c; }
    public String getJurisdictionState() { return jurisdictionState; }
    public java.time.LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(java.time.LocalDate d) { this.incidentDate = d; }
    public String getLocationBlock() { return locationBlock; }
    public void setLocationBlock(String l) { this.locationBlock = l; }
    public String getSummary() { return summary; }
    public void setSummary(String s) { this.summary = s; }
    public String getVideoNotes() { return videoNotes; }
    public void setVideoNotes(String n) { this.videoNotes = n; }
    public List<String> getEmbedRefs() { return embedRefs; }
    public void addEmbedRef(String url) { embedRefs.add(url); }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public java.time.Instant getLastVerifiedAt() { return lastVerifiedAt; }
    public void setLastVerifiedAt(java.time.Instant t) { this.lastVerifiedAt = t; }
    public java.time.Instant getCreatedAt() { return createdAt; }

    public void addSource(Source s) { s.setCrimeCase(this); sources.add(s); }
    public void addNamedIndividual(NamedIndividual n) { n.setCrimeCase(this); namedIndividuals.add(n); }
    public void addClaimReview(ClaimReview r) { r.setCrimeCase(this); claimReviews.add(r); }
}
