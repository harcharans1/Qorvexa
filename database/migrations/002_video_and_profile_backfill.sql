-- Run once on an existing Qorvexa Supabase database (safe to re-run).
begin;

-- The course page reads courses.video_url; the column was missing.
alter table public.courses add column if not exists video_url text;

-- Users who registered before the signup trigger existed have no profile/subscription row,
-- which makes "Save profile" and the dashboard plan silently do nothing for them.
insert into public.profiles(id, full_name)
select u.id, u.raw_user_meta_data ->> 'full_name' from auth.users u
on conflict (id) do nothing;

insert into public.subscriptions(user_id, plan, status)
select u.id, 'free', 'active' from auth.users u
where not exists (select 1 from public.subscriptions s where s.user_id = u.id);

commit;
