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
