-- $yllabus beta: read-only administrative oversight.
-- Apply after profiles, demo accounts and transfers migrations.
-- Do not allow public signup or user metadata to assign admin privileges.

create table if not exists public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.admin_members enable row level security;
revoke all on public.admin_members from public, anon, authenticated;

-- Provision the first administrator manually from the Supabase SQL editor
-- AFTER creating and verifying that person's Supabase Auth account:
--
-- insert into public.admin_members(user_id)
-- values ('REPLACE_WITH_VERIFIED_AUTH_USER_UUID')
-- on conflict (user_id) do nothing;
--
-- Do not run this with an unverified user ID or from the client app.

create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_admin is null or not exists (
    select 1 from public.admin_members where user_id = v_admin
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'students', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id,
        'email', p.email,
        'full_name', p.full_name,
        'university', p.university,
        'created_at', p.created_at
      ) order by p.created_at desc), '[]'::jsonb)
      from public.profiles p
    ),
    'accounts', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', a.id,
        'student_id', a.student_id,
        'account_type', a.account_type,
        'balance_cents', a.balance_cents,
        'currency', a.currency
      ) order by a.student_id, a.account_type), '[]'::jsonb)
      from public.demo_financial_accounts a
    ),
    'transfers', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', t.id,
        'sender_id', t.sender_id,
        'recipient_id', t.recipient_id,
        'amount_cents', t.amount_cents,
        'created_at', t.created_at
      ) order by t.created_at desc), '[]'::jsonb)
      from public.demo_transfers t
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

comment on function public.admin_overview() is
  'Read-only platform-wide simulated account overview; requires explicit admin membership.';
