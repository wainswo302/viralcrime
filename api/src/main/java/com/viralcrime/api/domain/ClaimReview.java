package com.viralcrime.api.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "claim_reviews")
public class ClaimReview {

    @Id @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id")
    private CrimeCase crimeCase;

    @Column(name = "claim_reviewed", nullable = false, columnDefinition = "text")
    private String claimReviewed;

    @Column(name = "rating_value", nullable = false)
    private int ratingValue;

    @Column(name = "rating_name", nullable = false)
    private String ratingName;

    protected ClaimReview() { }

    public ClaimReview(String claimReviewed, int ratingValue, String ratingName) {
        this.claimReviewed = claimReviewed;
        this.ratingValue = ratingValue;
        this.ratingName = ratingName;
    }

    public UUID getId() { return id; }
    public String getClaimReviewed() { return claimReviewed; }
    public int getRatingValue() { return ratingValue; }
    public String getRatingName() { return ratingName; }
    void setCrimeCase(CrimeCase c) { this.crimeCase = c; }
}
