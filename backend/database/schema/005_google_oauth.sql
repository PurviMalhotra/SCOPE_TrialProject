-- Google OAuth profile fields for users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS picture_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
    ON users (google_id)
    WHERE google_id IS NOT NULL;
