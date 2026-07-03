-- V2__add_headline.sql
-- Event-framed headline used as the page H1 and SEO title.
-- Kept separate from slug so the display text can be edited without changing URLs.
ALTER TABLE crime_cases ADD COLUMN headline VARCHAR(300);
