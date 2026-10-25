-- 003: contact form, plan priority list, admin read access.
begin;
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 5 and 200),
  topic text not null default 'General question' check (char_length(topic) <= 60),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'new' check (status in ('new','read','resolved')),
  created_at timestamptz not null default now()
);
create table if not exists public.plan_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('pro','business')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly','yearly')),
  created_at timestamptz not null default now(),
  unique(user_id, plan)
);
alter table public.contact_messages enable row level security;
alter table public.plan_requests enable row level security;

drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message" on public.contact_messages for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages" on public.contact_messages for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
drop policy if exists "Admins update messages" on public.contact_messages;
create policy "Admins update messages" on public.contact_messages for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "Users manage own plan requests" on public.plan_requests;
create policy "Users manage own plan requests" on public.plan_requests for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Admins read plan requests" on public.plan_requests;
create policy "Admins read plan requests" on public.plan_requests for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
commit;
