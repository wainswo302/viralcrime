-- V5__case_tags.sql
-- Free-form topic tags per case (e.g. "viral", "video-verified"). eventType
-- stays the authoritative single-value classification; tags are supplementary
-- and browsable the same way — see /tags/[tag] on the frontend.
ALTER TABLE crime_cases ADD COLUMN tags JSONB NOT NULL DEFAULT '[]';
