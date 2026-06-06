create table public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.intake_questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.intake_forms(id) on delete cascade,
  field_key text not null,
  label text not null,
  type text not null check (
    type in ('text', 'email', 'tel', 'textarea', 'select', 'number', 'date')
  ),
  placeholder text,
  is_required boolean not null default true,
  position integer not null check (position > 0),
  options jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_id, field_key),
  unique (form_id, position)
);

create index intake_questions_form_id_position_idx
on public.intake_questions (form_id, position);

alter table public.intake_forms enable row level security;
alter table public.intake_questions enable row level security;
