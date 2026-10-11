-- ─────────────────────────────────────────────────────────
-- Website content managed from the admin "Website Content" page
-- (About page story, leadership, team members, benefits, contact, home).
-- Stored as a single JSON document (row id = 1).
-- Run: psql -U <user> -d renature -f 002_site_content.sql
-- (The server also creates this table on first use if it is missing.)
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS site_content (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content    JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);
