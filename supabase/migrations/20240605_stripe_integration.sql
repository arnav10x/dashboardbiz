-- Table to store each user's Stripe API key and connection metadata
CREATE TABLE IF NOT EXISTS stripe_connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_key       TEXT NOT NULL,
  account_name  TEXT,
  connected_at  TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE stripe_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stripe connection"
  ON stripe_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table to cache synced Stripe charges
CREATE TABLE IF NOT EXISTS stripe_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_charge_id  TEXT NOT NULL,
  amount            NUMERIC(12,2) NOT NULL,
  currency          TEXT DEFAULT 'usd',
  customer_name     TEXT,
  customer_email    TEXT,
  description       TEXT,
  stripe_created_at TIMESTAMPTZ NOT NULL,
  synced_at         TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stripe_charge_id)
);

ALTER TABLE stripe_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own stripe payments"
  ON stripe_payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS stripe_payments_user_date
  ON stripe_payments(user_id, stripe_created_at DESC);
