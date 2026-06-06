insert into public.intake_forms (slug, title, description)
values (
  'student-intake',
  'Student Intake',
  'Default CSN student intake form.'
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

with form_row as (
  select id
  from public.intake_forms
  where slug = 'student-intake'
)
insert into public.intake_questions (
  form_id,
  field_key,
  label,
  type,
  placeholder,
  is_required,
  position,
  options
)
select
  form_row.id,
  question.field_key,
  question.label,
  question.type,
  question.placeholder,
  question.is_required,
  question.position,
  question.options
from form_row
cross join (
  values
    (
      'name',
      'What is your full name?',
      'text',
      'Jane Smith',
      true,
      1,
      null::jsonb
    ),
    (
      'email',
      'What is your email address?',
      'email',
      'jane@example.com',
      true,
      2,
      null::jsonb
    ),
    (
      'phone',
      'What is your phone number?',
      'tel',
      '(702) 555-0000',
      true,
      3,
      null::jsonb
    ),
    (
      'program',
      'Which program interests you?',
      'text',
      'e.g. Computer Science, Nursing...',
      true,
      4,
      null::jsonb
    )
) as question (
  field_key,
  label,
  type,
  placeholder,
  is_required,
  position,
  options
)
on conflict (form_id, field_key) do update
set
  label = excluded.label,
  type = excluded.type,
  placeholder = excluded.placeholder,
  is_required = excluded.is_required,
  position = excluded.position,
  options = excluded.options,
  updated_at = now();
