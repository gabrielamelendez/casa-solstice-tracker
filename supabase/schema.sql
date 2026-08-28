-- Casa Solstice · Tracker — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create table if not exists task_status (
  id text primary key,        -- e.g. "le1a", "ne2c"
  project text not null,      -- "le" or "ne"
  status text not null default 'Pendiente',
  updated_at timestamp with time zone default now()
);

-- Row Level Security: this app has no login — the Studio Tracker and the two
-- client trackers all connect with the same public anon key, distinguished
-- only by which route they're on. These policies let anyone with the anon
-- key read AND write. That's an accepted tradeoff for a small internal tool
-- (no payment or personal data lives in this table), but it does mean a
-- client could in theory edit their own status from devtools. If that ever
-- matters, add Supabase Auth and restrict the insert/update policy to an
-- authenticated "studio" role.
alter table task_status enable row level security;

create policy "public can read task_status"
  on task_status for select
  using (true);

create policy "public can insert task_status"
  on task_status for insert
  with check (true);

create policy "public can update task_status"
  on task_status for update
  using (true);

-- Enable Realtime on this table (Database → Replication in the dashboard
-- does the same thing; this is the SQL equivalent).
alter publication supabase_realtime add table task_status;
