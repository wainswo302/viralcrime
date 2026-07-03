-- V3__case_drafts.sql
-- Draft updates proposed by the monitor pipeline, awaiting human review.
-- Nothing here mutates a case until a human approves it — the AI-drafts,
-- human-gates principle made concrete.
CREATE TABLE case_drafts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id               UUID NOT NULL REFERENCES crime_cases (id) ON DELETE CASCADE,
    kind                  VARCHAR(30) NOT NULL,   -- DISPOSITION_UPDATE | STATUS_CHANGE | NOTE
    proposed_legal_status VARCHAR(20),
    proposed_disposition  TEXT,
    detail                TEXT NOT NULL,          -- human-readable summary of the change
    source_url            VARCHAR(1000),          -- what the monitor found
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING | APPROVED | REJECTED
    created_by            VARCHAR(120) NOT NULL DEFAULT 'monitor',
    reviewed_by           VARCHAR(120),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at           TIMESTAMPTZ
);
CREATE INDEX idx_drafts_status ON case_drafts (status);
CREATE INDEX idx_drafts_case   ON case_drafts (case_id);
