-- =============================================================================
-- 004_persistence_migration.sql
-- Migrates requestHistoryRepository and userRepository from in-memory to PostgreSQL.
--
-- Safe to run multiple times (uses IF NOT EXISTS / IF NOT EXISTS guards).
-- Run: psql -d scope_event_db -f database/schema/004_persistence_migration.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Part A: Extend users table for Google OAuth persistence
-- ---------------------------------------------------------------------------

-- Store Google OAuth subject ID for deduplication across restarts
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(128) UNIQUE;

-- Store Google profile picture URL (optional, display only)
ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;

-- ---------------------------------------------------------------------------
-- Part B: Request History table
--
-- Tracks CREATED / UPDATED / DELETED / APPROVED / REJECTED actions.
-- Intentionally no FK to event_requests so history of DELETED requests
-- is preserved (history entry is written BEFORE the row is deleted).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS request_history (
    history_id   SERIAL       PRIMARY KEY,
    request_id   INTEGER      NOT NULL,
    action       VARCHAR(50)  NOT NULL,
    from_status  VARCHAR(50),
    status       VARCHAR(50),
    comment      TEXT,
    actor_id     TEXT,
    actor_email  VARCHAR(100),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_history_request_id
    ON request_history (request_id);
