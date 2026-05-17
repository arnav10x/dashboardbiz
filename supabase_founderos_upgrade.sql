-- FounderOS next-phase functional foundation.
-- Run in Supabase SQL editor if any of these tables/columns are missing.

create table if not exists public.user_gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  streak_freezes integer not null default 0,
  last_active_date date,
  xp_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info',
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  status text not null default 'not_connected',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  role text not null default 'Member',
  status text not null default 'invited',
  created_at timestamptz not null default now()
);

alter table public.user_gamification enable row level security;
alter table public.notifications enable row level security;
alter table public.integration_connections enable row level security;
alter table public.team_members enable row level security;

do $$ begin
  create policy "manage own gamification" on public.user_gamification for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own notifications" on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own integrations" on public.integration_connections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own team members" on public.team_members for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Next phase: operating-system data layer.
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'activity',
  title text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_key text not null,
  memory_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, memory_key)
);

create table if not exists public.workspace_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid,
  goal_type text not null,
  title text not null,
  target_value numeric default 0,
  current_value numeric default 0,
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_mission_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id text not null,
  status text not null default 'created',
  task_id uuid,
  log_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique(user_id, mission_id, log_date)
);

alter table public.activity_events enable row level security;
alter table public.ai_memory enable row level security;
alter table public.workspace_goals enable row level security;
alter table public.daily_mission_logs enable row level security;

do $$ begin
  create policy "manage own activity events" on public.activity_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own ai memory" on public.ai_memory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own goals" on public.workspace_goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own mission logs" on public.daily_mission_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Next phase 3: intelligence, automations, and operating reports.
create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_key text not null,
  title text not null,
  description text,
  trigger_config jsonb not null default '{}'::jsonb,
  action_config jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, rule_key)
);

create table if not exists public.ceo_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null default current_date,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, report_date)
);

alter table public.automation_rules enable row level security;
alter table public.ceo_reports enable row level security;

do $$ begin
  create policy "manage own automation rules" on public.automation_rules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own ceo reports" on public.ceo_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


-- Phase 8: usernames, workspace invites, and multi-workspace membership.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{3,24}$')
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'Member',
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

alter table public.user_profiles enable row level security;
alter table public.workspace_members enable row level security;

do $$ begin
  create policy "profiles are searchable by username" on public.user_profiles for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "manage own profile" on public.user_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "view workspace members" on public.workspace_members for select using (auth.uid() = user_id or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "join invited workspace" on public.workspace_members for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "owners manage workspace members" on public.workspace_members for all using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())) with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));
exception when duplicate_object then null; end $$;

-- Allow a workspace owner to send a notification invite to another user.
do $$ begin
  create policy "authenticated users can send invite notifications" on public.notifications for insert with check (auth.uid() is not null);
exception when duplicate_object then null; end $$;

alter table public.notifications add column if not exists metadata jsonb not null default '{}'::jsonb;

-- Phase 9 profile/workspace/integration polish
alter table public.user_profiles add column if not exists username_changes_month text;
alter table public.user_profiles add column if not exists username_changes_count integer default 0;
alter table public.user_profiles add column if not exists updated_at timestamptz default now();
create unique index if not exists user_profiles_username_unique on public.user_profiles(lower(username));

alter table public.integration_connections add column if not exists updated_at timestamptz default now();

-- Integration request providers can be normal provider keys or custom:<tool_name>.

-- Phase 16: team invite acceptance, patch announcements, and polish settings.
alter table public.user_settings add column if not exists patch_announcements boolean not null default true;

create unique index if not exists team_members_workspace_user_unique on public.team_members(workspace_id, user_id);

do $$ begin
  create policy "workspace members can view team members" on public.team_members for select using (
    auth.uid() = user_id
    or exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = team_members.workspace_id and wm.user_id = auth.uid() and wm.status = 'active')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workspace members can insert themselves into team members" on public.team_members for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Phase 18: mobile, automations, and real-time collaboration.
alter table public.tasks add column if not exists workspace_id uuid;
alter table public.tasks add column if not exists due_date date;
alter table public.tasks add column if not exists recurrence text;
alter table public.tasks add column if not exists source text default 'manual';
alter table public.tasks add column if not exists automation_metadata jsonb not null default '{}'::jsonb;
alter table public.tasks add column if not exists assignee_id uuid;

alter table public.pipeline_leads add column if not exists workspace_id uuid;
alter table public.pipeline_leads add column if not exists owner_id uuid;
alter table public.pipeline_leads add column if not exists last_contacted_at timestamptz;
alter table public.pipeline_leads add column if not exists priority text default 'medium';
alter table public.pipeline_leads add column if not exists tags text[] default '{}';
alter table public.pipeline_leads add column if not exists close_probability integer default 25;

alter table public.activity_events add column if not exists workspace_id uuid;

create table if not exists public.collaboration_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled note',
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.collaboration_notes enable row level security;

do $$ begin
  create policy "workspace collaborators can view notes" on public.collaboration_notes for select using (
    auth.uid() = user_id
    or exists (select 1 from public.workspaces w where w.id = collaboration_notes.workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = collaboration_notes.workspace_id and wm.user_id = auth.uid() and wm.status = 'active')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "workspace collaborators can manage notes" on public.collaboration_notes for all using (
    auth.uid() = user_id
    or exists (select 1 from public.workspaces w where w.id = collaboration_notes.workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = collaboration_notes.workspace_id and wm.user_id = auth.uid() and wm.status = 'active')
  ) with check (
    auth.uid() = user_id
    or exists (select 1 from public.workspaces w where w.id = collaboration_notes.workspace_id and w.owner_id = auth.uid())
    or exists (select 1 from public.workspace_members wm where wm.workspace_id = collaboration_notes.workspace_id and wm.user_id = auth.uid() and wm.status = 'active')
  );
exception when duplicate_object then null; end $$;

create index if not exists tasks_workspace_due_idx on public.tasks(workspace_id, due_date);
create index if not exists pipeline_leads_workspace_followup_idx on public.pipeline_leads(workspace_id, follow_up_date);
create index if not exists collaboration_notes_workspace_idx on public.collaboration_notes(workspace_id, updated_at desc);
