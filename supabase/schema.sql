-- reports table: stores uploaded Excel files metadata
create table reports (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  file_name text not null,
  file_size integer,
  data_type text not null, -- 'ventas', 'finanzas', 'proyectos', 'mixto'
  row_count integer,
  columns jsonb,
  created_at timestamptz default now()
);

-- report_data table: stores parsed rows from Excel
create table report_data (
  id uuid default gen_random_uuid() primary key,
  report_id uuid references reports(id) on delete cascade,
  row_data jsonb not null,
  row_index integer,
  created_at timestamptz default now()
);

create index on report_data(report_id);

-- Row Level Security: enable and allow public access (single-user internal tool).
-- Each policy covers SELECT, INSERT, UPDATE and DELETE.
alter table reports enable row level security;
alter table report_data enable row level security;

drop policy if exists "Acceso público a reports" on reports;
drop policy if exists "Acceso público a report_data" on report_data;

create policy "Acceso público a reports"
  on reports for all
  using (true)
  with check (true);

create policy "Acceso público a report_data"
  on report_data for all
  using (true)
  with check (true);
