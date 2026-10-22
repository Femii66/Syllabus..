-- Recipient discovery is intentionally exact-match by email.
-- Do not expose the profiles table to other students.
create or replace function public.find_demo_recipient(p_email text)
returns table(id uuid, display_name text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_email is null or length(trim(p_email)) < 3 or length(p_email) > 254 then
    return;
  end if;
  return query
    select p.id, coalesce(nullif(trim(p.full_name), ''), 'Student')
    from public.profiles p
    where lower(p.email) = lower(trim(p_email))
      and p.id <> (select auth.uid())
    limit 1;
end;
$$;
revoke all on function public.find_demo_recipient(text) from public, anon;
grant execute on function public.find_demo_recipient(text) to authenticated;
