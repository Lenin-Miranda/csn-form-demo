insert into public.intake_forms (slug, title, description)
values (
  'student-intake',
  'CSN English Language Intake',
  'Questions for students who want to study English at the College of Southern Nevada.'
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
),
reposition_existing_questions as (
  update public.intake_questions
  set
    position = position + 100,
    updated_at = now()
  where form_id = (select id from form_row)
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
      'date_of_birth',
      'What is your date of birth?',
      'date',
      null,
      true,
      4,
      null::jsonb
    ),
    (
      'program',
      'Which English program are you most interested in?',
      'select',
      'Choose a program',
      true,
      5,
      '["Intensive English Program", "Academic English Preparation", "English Conversation and Pronunciation"]'::jsonb
    ),
    (
      'english_level',
      'How would you describe your current English level?',
      'select',
      'Choose your level',
      true,
      6,
      '["Beginner", "Elementary", "Intermediate", "Advanced"]'::jsonb
    ),
    (
      'has_studied_english_before',
      'Have you studied English in a classroom before?',
      'boolean',
      null,
      true,
      7,
      null::jsonb
    ),
    (
      'years_studying_english',
      'About how many years have you studied English?',
      'number',
      '0',
      false,
      8,
      null::jsonb
    ),
    (
      'preferred_start_date',
      'When would you like to start your English classes?',
      'date',
      null,
      true,
      9,
      null::jsonb
    ),
    (
      'preferred_schedule',
      'What class schedule works best for you?',
      'select',
      'Choose a schedule',
      true,
      10,
      '["Morning", "Afternoon", "Evening", "Weekend"]'::jsonb
    ),
    (
      'needs_help_with_visa',
      'Will you need help understanding visa or international student requirements?',
      'boolean',
      null,
      true,
      11,
      null::jsonb
    ),
    (
      'english_goals',
      'What do you hope to achieve by studying English at CSN?',
      'textarea',
      'Tell us about your goals, work plans, or academic plans.',
      true,
      12,
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
