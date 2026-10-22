-- $yllabus beta: simulated student-to-student transfers.
-- Requires profiles and demo_financial_accounts migrations.
-- All values are fictional. No real funds move.

create table if not exists public.demo_transfers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null,
  sender_id uuid not null references public.profiles(id),
  recipient_id uuid not null references public.profiles(id),
  source_account_id uuid not null references public.demo_financial_accounts(id),
  destination_account_id uuid not null references public.demo_financial_accounts(id),
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  constraint demo_transfers_distinct_students check (sender_id <> recipient_id),
  constraint demo_transfers_request_unique unique (sender_id, request_id)
);

create index if not exists demo_transfers_sender_created
  on public.demo_transfers(sender_id, created_at desc);
create index if not exists demo_transfers_recipient_created
  on public.demo_transfers(recipient_id, created_at desc);

alter table public.demo_transfers enable row level security;

drop policy if exists "Students can read their own demo transfers"
  on public.demo_transfers;
create policy "Students can read their own demo transfers"
  on public.demo_transfers for select to authenticated
  using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

revoke all on public.demo_transfers from anon, authenticated;
grant select on public.demo_transfers to authenticated;

-- This function is the ONLY permitted way for students to transfer demo funds.
-- Locking both accounts in a stable order prevents concurrent overspending
-- and reduces deadlocks when students send in opposite directions.
create or replace function public.send_demo_transfer(
  p_recipient_id uuid,
  p_source_type text,
  p_amount_cents bigint,
  p_request_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender uuid := (select auth.uid());
  v_source uuid;
  v_destination uuid;
  v_balance bigint;
  v_locked uuid;
  v_transfer uuid;
begin
  if v_sender is null then
    raise exception 'Authentication required';
  end if;
  if p_recipient_id is null or p_recipient_id = v_sender then
    raise exception 'Choose another student';
  end if;
  if p_source_type not in ('checking', 'savings') or p_source_type is null then
    raise exception 'Invalid source account';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 or p_amount_cents > 100000000 then
    raise exception 'Invalid transfer amount';
  end if;
  if p_request_id is null then
    raise exception 'Request ID required';
  end if;

  -- A retry with the same request ID must not debit twice.
  select id into v_transfer
  from public.demo_transfers
  where sender_id = v_sender and request_id = p_request_id;
  if found then
    return v_transfer;
  end if;

  select id into v_source from public.demo_financial_accounts
  where student_id = v_sender and account_type = p_source_type;
  select id into v_destination from public.demo_financial_accounts
  where student_id = p_recipient_id and account_type = 'checking';

  if v_source is null or v_destination is null then
    raise exception 'Student demo account not found';
  end if;

  for v_locked in
    select id from public.demo_financial_accounts
    where id in (v_source, v_destination)
    order by id
    for update
  loop
    null;
  end loop;

  -- Check again after locking: a concurrent identical request may have finished.
  select id into v_transfer
  from public.demo_transfers
  where sender_id = v_sender and request_id = p_request_id;
  if found then
    return v_transfer;
  end if;

  select balance_cents into v_balance
  from public.demo_financial_accounts where id = v_source;
  if v_balance < p_amount_cents then
    raise exception 'Insufficient demo balance';
  end if;

  update public.demo_financial_accounts
  set balance_cents = balance_cents - p_amount_cents, updated_at = now()
  where id = v_source;

  update public.demo_financial_accounts
  set balance_cents = balance_cents + p_amount_cents, updated_at = now()
  where id = v_destination;

  insert into public.demo_transfers
    (request_id, sender_id, recipient_id, source_account_id, destination_account_id, amount_cents)
  values
    (p_request_id, v_sender, p_recipient_id, v_source, v_destination, p_amount_cents)
  returning id into v_transfer;

  return v_transfer;
end;
$$;

revoke all on function public.send_demo_transfer(uuid, text, bigint, uuid) from public, anon;
grant execute on function public.send_demo_transfer(uuid, text, bigint, uuid) to authenticated;
