create table public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.students enable row level security;

alter table public.submissions
add column student_id uuid;

insert into public.students (name, email, phone)
select distinct on (lower(email))
  name,
  email,
  phone
from public.submissions
order by lower(email), created_at;

update public.submissions as submissions
set student_id = students.id
from public.students as students
where lower(students.email) = lower(submissions.email);

alter table public.submissions
alter column student_id set not null;

alter table public.submissions
add constraint submissions_student_id_fkey
foreign key (student_id)
references public.students(id)
on delete cascade;

create index submissions_student_id_idx
on public.submissions (student_id);

alter table public.submissions
drop column name,
drop column email,
drop column phone;
