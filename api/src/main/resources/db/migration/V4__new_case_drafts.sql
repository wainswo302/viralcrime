-- V4__new_case_drafts.sql
-- Extends the draft queue to cover NEW_CASE proposals (e.g. a manually
-- submitted video link), not just updates to a case that already exists.
-- case_id is now nullable: a NEW_CASE draft has no case yet, by definition.
ALTER TABLE case_drafts ALTER COLUMN case_id DROP NOT NULL;

ALTER TABLE case_drafts ADD COLUMN proposed_slug             VARCHAR(200);
ALTER TABLE case_drafts ADD COLUMN proposed_headline          VARCHAR(300);
ALTER TABLE case_drafts ADD COLUMN proposed_event_type        VARCHAR(80);
ALTER TABLE case_drafts ADD COLUMN proposed_jurisdiction_city VARCHAR(120);
ALTER TABLE case_drafts ADD COLUMN proposed_jurisdiction_state VARCHAR(2);
ALTER TABLE case_drafts ADD COLUMN proposed_embed_url         VARCHAR(1000);
