package com.viralcrime.api.domain;

/**
 * Role of a named individual. Deliberately minimal: we name defendants of
 * record, never a speculative "suspect". The absence of a SUSPECT value is
 * intentional and load-bearing.
 */
public enum IndividualRole {
    DEFENDANT
}
