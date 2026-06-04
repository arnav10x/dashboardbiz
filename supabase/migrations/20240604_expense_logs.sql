-- Expense logs table for granular cost tracking by category
CREATE TABLE IF NOT EXISTS expense_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category      TEXT NOT NULL DEFAULT 'other'
                  CHECK (category IN ('software','payroll','marketing','office','tools','other')),
  vendor        TEXT,
  description   TEXT,
  expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE expense_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expenses"
  ON expense_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS expense_logs_user_id_idx   ON expense_logs (user_id);
CREATE INDEX IF NOT EXISTS expense_logs_date_idx      ON expense_logs (user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS expense_logs_category_idx  ON expense_logs (user_id, category);
