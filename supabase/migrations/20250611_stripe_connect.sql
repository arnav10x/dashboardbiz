-- Stripe Connect integration fields on user_settings
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS stripe_access_token    TEXT,
  ADD COLUMN IF NOT EXISTS stripe_account_id      TEXT,
  ADD COLUMN IF NOT EXISTS stripe_last_synced_at  TIMESTAMPTZ;

-- Mark which revenue_logs were synced from Stripe so we can replace them on re-sync
ALTER TABLE revenue_logs
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS revenue_logs_source_idx ON revenue_logs (user_id, source);
