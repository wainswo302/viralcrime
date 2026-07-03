package com.viralcrime.api.domain;

/** Kinds of source. Naming requires an OFFICIAL_RECORD *and* MAINSTREAM_COVERAGE. */
public enum SourceType {
    OFFICIAL_RECORD,     // court docket, PD/DA release
    MAINSTREAM_COVERAGE, // established news outlet
    OTHER
}
