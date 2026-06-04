create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  program text not null,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;