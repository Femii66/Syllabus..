-- $yllabus beta: private student profiles.
-- Apply to the connected Supabase project before relying on profile data.
-- No banking balances or transactions are created by this migration.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  university text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (char_length(full_name) <= 100),
  constraint profiles_university_length check (char_length(university) <= 150)
);

alter table public.profiles enable row level security;

drop policy if exists "Students can view their own profile" on public.profiles;
create policy "Students can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Students can edit their own profile" on public.profiles;
create policy "Students can edit their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Email and user ID are managed by Supabase Auth, not editable from the client.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, university) on public.profiles to authenticated;

create or replace function public.create_student_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 100)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_student_registered on auth.users;
create trigger on_student_registered
  after insert on auth.users
  for each row execute function public.create_student_profile();

create or replace function public.sync_student_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = coalesce(new.email, ''), updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_student_email_changed on auth.users;
create trigger on_student_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_student_profile_email();

create or replace function public.touch_student_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_student_profile_updated on public.profiles;
create trigger on_student_profile_updated
  before update on public.profiles
  for each row execute function public.touch_student_profile();

-- Backfill accounts registered before this migration was applied.
insert into public.profiles (id, email, full_name)
select id, coalesce(email, ''), left(coalesce(raw_user_meta_data ->> 'full_name', ''), 100)
from auth.users
on conflict (id) do nothing;
