-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create index on refresh_token
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);

-- Create index on expires_at for cleanup queries
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create index on is_revoked
CREATE INDEX idx_sessions_is_revoked ON sessions(is_revoked);
