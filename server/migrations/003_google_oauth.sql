-- ─────────────────────────────────────────────────────────
-- Renature Google OAuth integration migration (idempotent)
-- ─────────────────────────────────────────────────────────

-- 1. Add google_id and auth_provider columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';

-- 2. Allow password_hash to be nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

SELECT 'Renature Google OAuth schema ready ✓' AS status;
