-- QORVEXA schema for Supabase PostgreSQL. Run in SQL Editor.
-- IMPORTANT: run this with a database owner; never expose service_role keys in Angular.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled Resume',
  content jsonb not null default '{}'::jsonb,
  template_name text not null default 'modern',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_resumes_user_updated on public.resumes(user_id, updated_at desc);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  thumbnail_url text,
  difficulty text not null default 'beginner',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_lessons_course_order on public.lessons(course_id, order_index);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique(user_id, course_id)
);
create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, lesson_id)
);

create table if not exists public.marketing_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null default '',
  platform text not null default 'LinkedIn',
  status text not null default 'Draft' check (status in ('Draft','Planned','Published')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_marketing_user_date on public.marketing_drafts(user_id, scheduled_at);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','pro','business')),
  status text not null default 'active' check (status in ('active','trialing','past_due','cancelled','expired')),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Upgrade columns when this file is applied to an earlier Qorvexa schema.
alter table public.courses add column if not exists thumbnail_url text;
alter table public.courses add column if not exists difficulty text not null default 'beginner';
alter table public.courses add column if not exists updated_at timestamptz not null default now();
alter table public.lessons add column if not exists video_url text;
alter table public.marketing_drafts add column if not exists scheduled_at timestamptz;
alter table public.subscriptions add column if not exists provider text;
alter table public.subscriptions add column if not exists provider_customer_id text;
alter table public.subscriptions add column if not exists provider_subscription_id text;
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists updated_at timestamptz not null default now();

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  insert into public.subscriptions(user_id, plan, status)
  select new.id, 'free', 'active' where not exists (select 1 from public.subscriptions s where s.user_id = new.id);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists set_resumes_updated_at on public.resumes;
create trigger set_resumes_updated_at before update on public.resumes for each row execute function public.set_updated_at();
drop trigger if exists set_marketing_updated_at on public.marketing_drafts;
create trigger set_marketing_updated_at before update on public.marketing_drafts for each row execute function public.set_updated_at();
drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at before update on public.courses for each row execute function public.set_updated_at();
drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.marketing_drafts enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_events enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
-- Prevent self-service privilege escalation through the profile role column.
create or replace function public.prevent_profile_role_escalation()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role and current_user not in ('postgres','service_role') and coalesce(auth.jwt() ->> 'role','') <> 'service_role' then
    raise exception 'Profile role can only be changed by a trusted administrator';
  end if;
  return new;
end; $$;
drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role before update on public.profiles for each row execute function public.prevent_profile_role_escalation();

drop policy if exists "Users can CRUD own resumes" on public.resumes;
create policy "Users can CRUD own resumes" on public.resumes for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Published courses are public" on public.courses;
create policy "Published courses are public" on public.courses for select using (is_published = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses" on public.courses for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Lessons of published courses are public" on public.lessons;
create policy "Lessons of published courses are public" on public.lessons for select using (exists (select 1 from public.courses c where c.id = lessons.course_id and (c.is_published = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))));
drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons" on public.lessons for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Users manage own enrollments" on public.enrollments;
create policy "Users manage own enrollments" on public.enrollments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own progress" on public.lesson_progress;
create policy "Users manage own progress" on public.lesson_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users manage own drafts" on public.marketing_drafts;
create policy "Users manage own drafts" on public.marketing_drafts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
-- Subscription writes and payment events must only come from a trusted backend/webhook.

-- Bootstrap the first admin manually after creating your account:
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
