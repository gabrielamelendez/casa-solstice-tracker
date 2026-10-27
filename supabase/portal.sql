-- Casa Solstice · Portal de cliente — invitados, RSVP y mesas
-- Corre esto UNA vez en Supabase → SQL Editor → New query (después de schema.sql).

create table if not exists seating_tables (
  id uuid primary key,
  project text not null,            -- "le", "ne", "sj", "demo"…
  name text not null,               -- "Mesa 1", "Roma", "Principal"…
  shape text not null default 'Redonda',   -- Redonda | Imperial
  capacity int not null default 10,
  sort int not null default 0,
  created_at timestamptz default now()
);

create table if not exists guests (
  id uuid primary key,
  project text not null,
  name text not null,               -- como aparece en la invitación
  group_name text,                  -- Familia novia, Amigos, Trabajo…
  invited int not null default 1,   -- cupos de la invitación
  rsvp text not null default 'Pendiente',  -- Pendiente | Confirmado | No asiste
  attending int,                    -- cuántos confirmaron (≤ invited)
  dietary text,                     -- restricciones alimentarias
  message text,                     -- mensaje para los novios
  notes text,                       -- notas internas de los novios
  table_id uuid references seating_tables(id) on delete set null,
  responded_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists guests_project_idx on guests(project);
create index if not exists seating_tables_project_idx on seating_tables(project);

-- Mismo modelo que task_status: sin login, la clave pública lee y escribe.
-- Ver "Nota de seguridad" en el README.
alter table guests enable row level security;
alter table seating_tables enable row level security;

create policy "public read guests"   on guests for select using (true);
create policy "public insert guests" on guests for insert with check (true);
create policy "public update guests" on guests for update using (true);
create policy "public delete guests" on guests for delete using (true);

create policy "public read tables"   on seating_tables for select using (true);
create policy "public insert tables" on seating_tables for insert with check (true);
create policy "public update tables" on seating_tables for update using (true);
create policy "public delete tables" on seating_tables for delete using (true);

alter publication supabase_realtime add table guests;
alter publication supabase_realtime add table seating_tables;
