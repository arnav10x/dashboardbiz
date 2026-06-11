-- Align calendar tables with the application code.
-- The app stores calendar_events as day-level events (event_date + optional
-- start/end times of day, all_day flag, display color, source tag) and links
-- follow-up events to pipeline_leads. cal_entries saves include workspace_id.

-- 1) cal_entries: workspace_id used by Overview quick-log and P/L calendar saves
ALTER TABLE cal_entries
  ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- 2) calendar_events: columns the app reads/writes
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS all_day BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#23c767';
ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

-- 3) start_time / end_time: timestamptz NOT NULL -> nullable time of day
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'calendar_events'
      AND column_name = 'start_time' AND data_type = 'timestamp with time zone'
  ) THEN
    UPDATE calendar_events SET event_date = (start_time AT TIME ZONE 'UTC')::date WHERE event_date IS NULL;
    ALTER TABLE calendar_events ALTER COLUMN start_time DROP NOT NULL;
    ALTER TABLE calendar_events ALTER COLUMN end_time DROP NOT NULL;
    ALTER TABLE calendar_events ALTER COLUMN start_time TYPE TIME USING (start_time AT TIME ZONE 'UTC')::time;
    ALTER TABLE calendar_events ALTER COLUMN end_time TYPE TIME USING (end_time AT TIME ZONE 'UTC')::time;
  END IF;
END $$;

-- 4) lead_id must reference pipeline_leads (the table the app writes), not leads
UPDATE calendar_events SET lead_id = NULL
WHERE lead_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM pipeline_leads p WHERE p.id = calendar_events.lead_id);
ALTER TABLE calendar_events DROP CONSTRAINT IF EXISTS calendar_events_lead_id_fkey;
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_lead_id_fkey
  FOREIGN KEY (lead_id) REFERENCES pipeline_leads(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx ON calendar_events (user_id, event_date);
CREATE INDEX IF NOT EXISTS calendar_events_lead_idx ON calendar_events (lead_id);
