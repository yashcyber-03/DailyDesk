-- DailyDesk: per-account daily AI quota (Phase 7)
-- Run after 20261101000000_initial_schema.sql. Signed-in users cannot write this table directly;
-- the server calls consume_ai_quota() with the user's session.

create table public.ai_usage (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  usage_date date not null default ((now() at time zone 'utc')::date),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (user_id, usage_date)
);

alter table public.ai_usage enable row level security;

-- Read-only for the owner. There are intentionally no insert, update or delete policies.
create policy "ai_usage_select_own" on public.ai_usage for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.ai_usage from anon, authenticated;
grant select on public.ai_usage to authenticated;

-- Atomically counts one AI request for the signed-in user.
-- Returns true when the request is allowed and false when today's limit is used up.
create or replace function public.consume_ai_quota(p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_today date := (now() at time zone 'utc')::date;
  v_count integer;
begin
  if v_user is null or p_limit is null or p_limit < 1 then
    return false;
  end if;

  -- keep the table small: forget days older than 30 days
  delete from public.ai_usage where user_id = v_user and usage_date < v_today - 30;

  insert into public.ai_usage as u (user_id, usage_date, request_count)
  values (v_user, v_today, 1)
  on conflict (user_id, usage_date)
  do update set request_count = u.request_count + 1
  where u.request_count < p_limit
  returning u.request_count into v_count;

  return v_count is not null;
end;
$$;

revoke execute on function public.consume_ai_quota(integer) from public, anon;
grant execute on function public.consume_ai_quota(integer) to authenticated;
