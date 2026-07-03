package com.viralcrime.api.domain;

/** Official legal status of the matter. Drives the naming gate. */
public enum LegalStatus {
    NONE_REPORTED,   // no charges on record
    CHARGED,
    PLEA,
    CONVICTED,
    ACQUITTED,       // favorable outcome — not auto-nameable
    DISMISSED,       // favorable outcome — not auto-nameable
    EXPUNGED         // record sealed — never nameable, triggers de-indexing
}
