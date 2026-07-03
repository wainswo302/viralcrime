package com.viralcrime.api.domain;

/** Verification status of a viral clip. Maps to a ClaimReview rating. */
public enum VideoProvenance {
    AUTHENTIC,       // real, original, correctly contextualized
    MISCAPTIONED,    // real video, false claim attached
    RECIRCULATED,    // real but old, posted as new
    STAGED,          // scripted / performed
    AI_GENERATED,    // synthetic
    UNVERIFIED;      // cannot confirm — published *as* unverified

    /** ClaimReview rating on a 1 (fabricated) .. 5 (true) scale. */
    public int ratingValue() {
        return switch (this) {
            case AUTHENTIC -> 5;
            case MISCAPTIONED, RECIRCULATED -> 3;
            case STAGED -> 2;
            case AI_GENERATED -> 1;
            case UNVERIFIED -> 0; // omit ClaimReview until resolved
        };
    }
}
