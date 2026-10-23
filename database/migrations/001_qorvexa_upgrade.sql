-- Run this migration against an existing Qorvexa Supabase database.
-- For a new database, use ../schema.sql instead.
begin;

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

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "Published courses are public" on public.courses;
create policy "Published courses are public" on public.courses for select using (is_published = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses" on public.courses for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Lessons of published courses are public" on public.lessons;
create policy "Lessons of published courses are public" on public.lessons for select using (exists (select 1 from public.courses c where c.id = lessons.course_id and (c.is_published = true or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))));
drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons" on public.lessons for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

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
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_new_user();

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

alter table public.payment_events enable row level security;
drop policy if exists "Users read own subscription" on public.subscriptions;
create policy "Users read own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);

commit;
