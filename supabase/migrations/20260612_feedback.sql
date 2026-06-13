-- Feedback submissions from the in-app feedback modal.
-- Email delivery (Resend → prspectve@outlook.com) is best-effort;
-- this table is the source of truth so feedback is never lost.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  type text not null default 'feedback',
  location text,
  message text not null,
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

create policy "Users can insert own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

create policy "Users can view own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);
