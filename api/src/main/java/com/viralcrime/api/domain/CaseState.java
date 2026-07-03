package com.viralcrime.api.domain;

/**
 * Lifecycle states for a case. The legal transitions between these are
 * enforced by {@code CaseLifecycleService} — this enum is just the vocabulary.
 */
public enum CaseState {
    SURFACED,        // detected, metadata only, nothing published
    VERIFYING,       // provenance check underway
    PUBLISHED_OPEN,  // event verified & public; case unresolved
    MONITORING,      // watching dockets for a disposition
    RESOLVED,        // disposition recorded & sourced
    CORRECTED,       // a published fact was revised
    RETRACTED        // pulled & de-indexed (terminal)
}
