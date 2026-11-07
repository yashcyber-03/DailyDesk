-- DailyDesk initial schema (Phase 6)
-- Run once in the Supabase dashboard (SQL Editor) or with `supabase db push`.
-- Every table has Row Level Security: a signed-in user can only touch their own rows.

------------------------------------------------------------------------------
-- Helper functions
------------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Caps how many rows one user can create in a table (argument 1 = maximum).
create or replace function public.enforce_row_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  max_rows integer := tg_argv[0]::integer;
  current_rows integer;
begin
  execute format('select count(*) from %I.%I where user_id = $1', tg_table_schema, tg_table_name)
    into current_rows using new.user_id;
  if current_rows >= max_rows then
    raise exception 'Limit of % rows reached for %', max_rows, tg_table_name using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

------------------------------------------------------------------------------
-- Tables
------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only preferences the user may change themselves. Plan or billing data must NOT live here.
create table public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tool_slug text not null check (tool_slug ~ '^[a-z0-9-]{1,64}$'),
  created_at timestamptz not null default now(),
  unique (user_id, tool_slug)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 200),
  content text not null default '' check (char_length(content) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 500),
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.planner_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan_date date not null,
  start_time text check (start_time is null or start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  title text not null check (char_length(title) between 1 and 300),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  completed_dates date[] not null default '{}' check (cardinality(completed_dates) <= 3660),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One row per user and tool, so the table stays small. Powers "recently used" and the activity overview.
create table public.tool_history (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tool_slug text not null check (tool_slug ~ '^[a-z0-9-]{1,64}$'),
  use_count integer not null default 1,
  last_used_at timestamptz not null default now(),
  primary key (user_id, tool_slug)
);

------------------------------------------------------------------------------
-- Indexes (foreign keys and common queries)
------------------------------------------------------------------------------
create index notes_user_updated_idx on public.notes (user_id, updated_at desc);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);
create index planner_entries_user_date_idx on public.planner_entries (user_id, plan_date);
create index habits_user_created_idx on public.habits (user_id, created_at);
create index tool_history_user_last_used_idx on public.tool_history (user_id, last_used_at desc);

------------------------------------------------------------------------------
-- Triggers
------------------------------------------------------------------------------

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.planner_entries
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.habits
  for each row execute function public.set_updated_at();

create trigger enforce_row_limit before insert on public.favorites
  for each row execute function public.enforce_row_limit(100);

create trigger enforce_row_limit before insert on public.notes
  for each row execute function public.enforce_row_limit(500);

create trigger enforce_row_limit before insert on public.tasks
  for each row execute function public.enforce_row_limit(1000);

create trigger enforce_row_limit before insert on public.planner_entries
  for each row execute function public.enforce_row_limit(2000);

create trigger enforce_row_limit before insert on public.habits
  for each row execute function public.enforce_row_limit(50);


-- Create a profile and settings row automatically when someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''), 80))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Counts a tool visit for the signed-in user (runs with the caller's permissions, so RLS applies).
create or replace function public.record_tool_use(p_slug text)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.tool_history (user_id, tool_slug)
  values (auth.uid(), p_slug)
  on conflict (user_id, tool_slug)
  do update set use_count = public.tool_history.use_count + 1, last_used_at = now();
$$;

------------------------------------------------------------------------------
-- Row Level Security
------------------------------------------------------------------------------

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


alter table public.user_settings enable row level security;
create policy "user_settings_select_own" on public.user_settings for select to authenticated
  using (user_id = (select auth.uid()));
create policy "user_settings_insert_own" on public.user_settings for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "user_settings_update_own" on public.user_settings for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));


alter table public.favorites enable row level security;
create policy "favorites_select_own" on public.favorites for select to authenticated
  using (user_id = (select auth.uid()));
create policy "favorites_insert_own" on public.favorites for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "favorites_update_own" on public.favorites for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "favorites_delete_own" on public.favorites for delete to authenticated
  using (user_id = (select auth.uid()));


alter table public.notes enable row level security;
create policy "notes_select_own" on public.notes for select to authenticated
  using (user_id = (select auth.uid()));
create policy "notes_insert_own" on public.notes for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "notes_update_own" on public.notes for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "notes_delete_own" on public.notes for delete to authenticated
  using (user_id = (select auth.uid()));


alter table public.tasks enable row level security;
create policy "tasks_select_own" on public.tasks for select to authenticated
  using (user_id = (select auth.uid()));
create policy "tasks_insert_own" on public.tasks for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "tasks_update_own" on public.tasks for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "tasks_delete_own" on public.tasks for delete to authenticated
  using (user_id = (select auth.uid()));


alter table public.planner_entries enable row level security;
create policy "planner_entries_select_own" on public.planner_entries for select to authenticated
  using (user_id = (select auth.uid()));
create policy "planner_entries_insert_own" on public.planner_entries for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "planner_entries_update_own" on public.planner_entries for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "planner_entries_delete_own" on public.planner_entries for delete to authenticated
  using (user_id = (select auth.uid()));


alter table public.habits enable row level security;
create policy "habits_select_own" on public.habits for select to authenticated
  using (user_id = (select auth.uid()));
create policy "habits_insert_own" on public.habits for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "habits_update_own" on public.habits for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "habits_delete_own" on public.habits for delete to authenticated
  using (user_id = (select auth.uid()));


alter table public.tool_history enable row level security;
create policy "tool_history_select_own" on public.tool_history for select to authenticated
  using (user_id = (select auth.uid()));
create policy "tool_history_insert_own" on public.tool_history for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "tool_history_update_own" on public.tool_history for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "tool_history_delete_own" on public.tool_history for delete to authenticated
  using (user_id = (select auth.uid()));


------------------------------------------------------------------------------
-- Privileges: signed-out visitors get nothing, signed-in users only what RLS allows
------------------------------------------------------------------------------
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant select, insert, update on public.profiles, public.user_settings to authenticated;
grant select, insert, update, delete on
  public.favorites, public.notes, public.tasks, public.planner_entries, public.habits, public.tool_history
  to authenticated;

revoke execute on function public.record_tool_use(text) from public, anon;
grant execute on function public.record_tool_use(text) to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_row_limit() from public, anon, authenticated;

------------------------------------------------------------------------------
-- Backfill: accounts created before this migration
------------------------------------------------------------------------------
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;
insert into public.user_settings (user_id) select id from auth.users on conflict (user_id) do nothing;
