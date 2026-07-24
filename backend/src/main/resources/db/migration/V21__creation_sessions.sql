ALTER TABLE creation_sessions
    ALTER COLUMN status SET DEFAULT 'DRAFT',
ALTER COLUMN config SET DEFAULT '{}';

UPDATE creation_sessions SET config = '{}' WHERE config IS NULL;

ALTER TABLE creation_sessions
    ALTER COLUMN config SET NOT NULL,
ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;

DROP INDEX idx_creation_sessions_user;
CREATE INDEX idx_creation_sessions_user ON creation_sessions (user_id, created_at DESC);