create table public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  template text not null check (char_length(btrim(template)) > 0),
  recipient_email text not null check (char_length(btrim(recipient_email)) > 3),
  payload jsonb not null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'sent', 'failed')
  ),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (submission_id, template)
);

create index email_jobs_submission_id_idx
on public.email_jobs (submission_id);

create index email_jobs_status_idx
on public.email_jobs (status);

create index email_jobs_created_at_idx
on public.email_jobs (created_at);

create index email_jobs_pending_created_at_idx
on public.email_jobs (created_at)
where status = 'pending';

alter table public.email_jobs enable row level security;
