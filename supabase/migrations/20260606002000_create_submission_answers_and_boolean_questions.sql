alter table public.intake_questions
drop constraint if exists intake_questions_type_check;

alter table public.intake_questions
add constraint intake_questions_type_check
check (
  type in (
    'text',
    'email',
    'tel',
    'textarea',
    'select',
    'number',
    'date',
    'boolean'
  )
);

create table public.submission_answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id uuid not null references public.intake_questions(id) on delete restrict,
  field_key text not null,
  question_type text not null check (
    question_type in (
      'text',
      'email',
      'tel',
      'textarea',
      'select',
      'number',
      'date',
      'boolean'
    )
  ),
  answer jsonb not null,
  created_at timestamptz not null default now(),
  unique (submission_id, question_id)
);

create index submission_answers_submission_id_idx
on public.submission_answers (submission_id);

create index submission_answers_question_id_idx
on public.submission_answers (question_id);

alter table public.submission_answers enable row level security;
