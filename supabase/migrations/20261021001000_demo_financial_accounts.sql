-- $yllabus beta: simulated checking and savings accounts.
-- This migration requires the student profiles migration.
-- Balances represent fictional cents, not deposits or real money.
-- Clients have read-only access. Future transfers must use a validated
-- server-side transaction/RPC, never direct client balance updates.

create table if not exists public.demo_financial_accounts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  account_type text not null check (account_type in ('checking', 'savings')),
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, account_type)
);

comment on table public.demo_financial_accounts is
  'Simulated balances for the $yllabus beta; not real financial accounts.';

alter table public.demo_financial_accounts enable row level security;

drop policy if exists "Students view their own demo accounts"
  on public.demo_financial_accounts;
create policy "Students view their own demo accounts"
  on public.demo_financial_accounts
  for select to authenticated
  using ((select auth.uid()) = student_id);

revoke all on public.demo_financial_accounts from anon, authenticated;
grant select on public.demo_financial_accounts to authenticated;

-- The signup/profile trigger inserts one checking and one savings account.
-- A unique constraint makes account provisioning safe to retry.
create or replace function public.provision_demo_financial_accounts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.demo_financial_accounts
    (student_id, account_type, balance_cents)
  values
    (new.id, 'checking', 248055),
    (new.id, 'savings', 812000)
  on conflict (student_id, account_type) do nothing;
  return new;
end;
$$;

drop trigger if exists on_student_profile_create_accounts on public.profiles;
create trigger on_student_profile_create_accounts
  after insert on public.profiles
  for each row execute function public.provision_demo_financial_accounts();

-- Provision existing profiles, including students who signed up before
-- this migration. Re-running does not reset existing balances.
insert into public.demo_financial_accounts (student_id, account_type, balance_cents)
select p.id, a.account_type, a.balance_cents
from public.profiles as p
cross join (values
  ('checking', 248055::bigint),
  ('savings', 812000::bigint)
) as a(account_type, balance_cents)
on conflict (student_id, account_type) do nothing;
