create extension if not exists pgcrypto;

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,
  subject text not null default '',
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  student_number text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  unique(class_id, student_number)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(question_id, student_id)
);

create index if not exists idx_classes_teacher_id on public.classes(teacher_id);
create index if not exists idx_students_class_id on public.students(class_id);
create index if not exists idx_questions_class_id on public.questions(class_id);
create index if not exists idx_answers_student_id on public.answers(student_id);
create index if not exists idx_answers_question_id on public.answers(question_id);

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;

revoke all on public.teachers from anon, authenticated;
revoke all on public.classes from anon, authenticated;
revoke all on public.students from anon, authenticated;
revoke all on public.questions from anon, authenticated;
revoke all on public.answers from anon, authenticated;

grant all on public.teachers to service_role;
grant all on public.classes to service_role;
grant all on public.students to service_role;
grant all on public.questions to service_role;
grant all on public.answers to service_role;
