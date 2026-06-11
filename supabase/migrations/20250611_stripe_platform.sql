-- Stripe platform: connected accounts created via V2 API
-- Each prspectve user gets one Stripe connected account they can use to accept payments
CREATE TABLE IF NOT EXISTS stripe_connected_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT stripe_connected_accounts_user_unique UNIQUE (user_id)
);

ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own connected account"
  ON stripe_connected_accounts FOR ALL USING (auth.uid() = user_id);

-- Platform subscription fields: tracks the user's prspectve Pro subscription
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS stripe_subscription_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;
