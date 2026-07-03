-- V1__init_cases.sql
-- Core schema for the resolved-case & verification database.
-- The lifecycle state and the naming-gate fields are first-class columns,
-- because they encode business rules the application layer enforces.

CREATE TABLE crime_cases (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug              VARCHAR(200) NOT NULL UNIQUE,        -- event-framed, no private name
    state             VARCHAR(20)  NOT NULL,               -- CaseState enum
    event_type        VARCHAR(40)  NOT NULL,
    jurisdiction_city   VARCHAR(120) NOT NULL,
    jurisdiction_county VARCHAR(120),
    jurisdiction_state  VARCHAR(2)   NOT NULL,
    incident_date     DATE,
    location_block    VARCHAR(200),                        -- block-level only, never a residence
    summary           TEXT,                                -- event-framed prose

    -- video / verification layer
    video_provenance  VARCHAR(20)  NOT NULL DEFAULT 'UNVERIFIED',
    video_notes       TEXT,
    embed_refs        JSONB        NOT NULL DEFAULT '[]',  -- native embed URLs only, never rehosted files

    -- legal
    legal_status      VARCHAR(20)  NOT NULL DEFAULT 'NONE_REPORTED',
    disposition       TEXT,                                -- required before state may reach RESOLVED

    -- monitoring
    monitoring_active BOOLEAN      NOT NULL DEFAULT TRUE,
    last_checked_at   TIMESTAMPTZ,

    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    last_verified_at  TIMESTAMPTZ
);

CREATE INDEX idx_cases_jurisdiction ON crime_cases (jurisdiction_state, jurisdiction_city);
CREATE INDEX idx_cases_state        ON crime_cases (state);

-- Primary sources. A claim without at least one of these does not get published.
CREATE TABLE sources (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES crime_cases (id) ON DELETE CASCADE,
    source_type VARCHAR(30) NOT NULL,   -- OFFICIAL_RECORD | MAINSTREAM_COVERAGE | OTHER
    url         VARCHAR(1000) NOT NULL,
    label       VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sources_case ON sources (case_id);

-- Fact-check entries (map 1:1 to Schema.org ClaimReview on the page).
CREATE TABLE claim_reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID NOT NULL REFERENCES crime_cases (id) ON DELETE CASCADE,
    claim_reviewed  TEXT NOT NULL,
    rating_value    INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    rating_name     VARCHAR(80) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_claimreviews_case ON claim_reviews (case_id);

-- Named individuals. The application NEVER serializes one of these unless the
-- naming gate passes. gate_passed is set by a human, never by the pipeline.
CREATE TABLE named_individuals (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id      UUID NOT NULL REFERENCES crime_cases (id) ON DELETE CASCADE,
    full_name    VARCHAR(200) NOT NULL,
    role         VARCHAR(20) NOT NULL,        -- DEFENDANT only; never a speculative "suspect"
    gate_passed  BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by  VARCHAR(120),                -- human editor who set the gate
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_named_case ON named_individuals (case_id);

-- Append-only audit / corrections log.
CREATE TABLE case_audit (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES crime_cases (id) ON DELETE CASCADE,
    at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor       VARCHAR(120),
    change_kind VARCHAR(40) NOT NULL,   -- STATE_CHANGE | CORRECTION | GATE_SET | DE_INDEX ...
    detail      TEXT,
    reason      TEXT
);
CREATE INDEX idx_audit_case ON case_audit (case_id);
