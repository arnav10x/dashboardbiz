-- Add OAuth token columns and make api_key optional
ALTER TABLE stripe_connections
  ADD COLUMN IF NOT EXISTS access_token TEXT,
  ADD COLUMN IF NOT EXISTS stripe_user_id TEXT;

ALTER TABLE stripe_connections ALTER COLUMN api_key DROP NOT NULL;
