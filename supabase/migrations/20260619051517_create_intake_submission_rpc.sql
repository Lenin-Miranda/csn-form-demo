create or replace function public.create_intake_submission(
  p_form_slug text,
  p_name text,
  p_email text,
  p_phone text,
  p_program text,
  p_answers jsonb,
  p_locale text default 'en'
)
returns table (
  id uuid,
  student_id uuid,
  program text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_form_id uuid;
  v_form_slug text := coalesce(nullif(btrim(p_form_slug), ''), 'student-intake');
  v_email text := lower(btrim(p_email));
  v_locale text := case when lower(btrim(p_locale)) in ('en', 'es') then lower(btrim(p_locale)) else 'en' end;
  v_student_id uuid;
  v_submission_id uuid;
  v_created_at timestamptz;
  v_answers jsonb := coalesce(p_answers, '[]'::jsonb);
begin
  select intake_forms.id
  into v_form_id
  from public.intake_forms
  where intake_forms.slug = v_form_slug;

  if v_form_id is null then
    raise exception 'Intake form not found' using errcode = '22023';
  end if;

  if jsonb_typeof(v_answers) <> 'array' then
    raise exception 'answers must be a JSON array' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_answers) as answer(value)
    where nullif(answer.value->>'questionId', '') is null
  ) then
    raise exception 'answers must include questionId' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_answers) as answer(value)
    left join public.intake_questions as question
      on question.id = (answer.value->>'questionId')::uuid
      and question.form_id = v_form_id
    where question.id is null
  ) then
    raise exception 'Question does not belong to the selected form' using errcode = '22023';
  end if;

  insert into public.students (name, email, phone)
  values (btrim(p_name), v_email, btrim(p_phone))
  on conflict (email) do nothing;

  select students.id
  into v_student_id
  from public.students
  where students.email = v_email;

  insert into public.submissions (student_id, program)
  values (v_student_id, btrim(p_program))
  returning submissions.id, submissions.created_at
  into v_submission_id, v_created_at;

  insert into public.submission_answers (
    submission_id,
    question_id,
    field_key,
    question_type,
    answer
  )
  select
    v_submission_id,
    (answer.value->>'questionId')::uuid,
    answer.value->>'fieldKey',
    answer.value->>'questionType',
    answer.value->'answer'
  from jsonb_array_elements(v_answers) as answer(value);

  insert into public.email_jobs (
    submission_id,
    template,
    recipient_email,
    payload
  )
  values (
    v_submission_id,
    'submission_confirmation',
    v_email,
    jsonb_build_object(
      'submissionId', v_submission_id,
      'formSlug', v_form_slug,
      'studentName', btrim(p_name),
      'studentEmail', v_email,
      'program', btrim(p_program),
      'locale', v_locale
    )
  );

  return query
  select v_submission_id, v_student_id, btrim(p_program), v_created_at;
end;
$$;

revoke all on function public.create_intake_submission(text, text, text, text, text, jsonb, text) from public;
grant execute on function public.create_intake_submission(text, text, text, text, text, jsonb, text) to service_role;
