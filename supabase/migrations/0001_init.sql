-- ─────────────────────────────────────────────────────────────────────
--  AuraLoop initial schema
--  Mirrors the shapes already used by the Zustand store so we can swap
--  the persistence layer with minimal code change. RLS is on for every
--  user-owned table; auth.uid() is the gate.
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── helper: keep an updated_at column fresh on every UPDATE ─────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────
--  profiles — one row per auth.users, holds display data
-- ─────────────────────────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text,
  handle          text unique,
  email           text,
  avatar_emoji    text default '✨',
  joined_at       timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  user_state — aura score + streak, one row per user
-- ─────────────────────────────────────────────────────────────────────
create table public.user_state (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  aura_score      integer not null default 78 check (aura_score between 0 and 100),
  streak          integer not null default 0  check (streak >= 0),
  wrapped_data    jsonb   not null default '{}'::jsonb,
  updated_at      timestamptz not null default now()
);

create trigger user_state_set_updated_at
  before update on public.user_state
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  settings — per-user app preferences
-- ─────────────────────────────────────────────────────────────────────
create table public.settings (
  user_id                  uuid primary key references auth.users(id) on delete cascade,
  round_up_step            integer not null default 10 check (round_up_step in (10, 20, 50)),
  auto_save                boolean not null default true,
  notify_daily_digest      boolean not null default true,
  notify_invisible_spend   boolean not null default true,
  notify_jar_milestones    boolean not null default false,
  exclude_subscriptions    boolean not null default false,
  updated_at               timestamptz not null default now()
);

create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  jars — savings goal jars
-- ─────────────────────────────────────────────────────────────────────
create table public.jars (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  emoji           text,
  icon_key        text,
  target_amount   integer not null check (target_amount > 0),
  saved_amount    integer not null default 0 check (saved_amount >= 0),
  color           text,
  months_left     integer check (months_left is null or months_left >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index jars_user_id_idx on public.jars (user_id);

create trigger jars_set_updated_at
  before update on public.jars
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
--  transactions — every spend / round-up event
-- ─────────────────────────────────────────────────────────────────────
create table public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  merchant        text,
  amount          integer not null check (amount >= 0),
  saved_amount    integer not null default 0 check (saved_amount >= 0),
  category        text,
  vibe            text check (vibe in ('calm', 'flow', 'spark', 'burn')),
  payment_method  text check (payment_method in ('UPI', 'Card', 'Wallet')),
  source          text not null default 'manual' check (source in ('manual', 'sms', 'import')),
  jar_id          uuid references public.jars(id) on delete set null,
  occurred_at     timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index transactions_user_id_occurred_at_idx
  on public.transactions (user_id, occurred_at desc);

create index transactions_jar_id_idx
  on public.transactions (jar_id) where jar_id is not null;

-- ─────────────────────────────────────────────────────────────────────
--  insights — surfaced cards in the bell + insights page
-- ─────────────────────────────────────────────────────────────────────
create table public.insights (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  title           text not null,
  body            text,
  severity        text not null default 'info' check (severity in ('good', 'warn', 'info')),
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

create index insights_user_id_created_at_idx
  on public.insights (user_id, created_at desc);

-- ─────────────────────────────────────────────────────────────────────
--  Bootstrap rows on signup — profile + state + settings
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
    values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.user_state (user_id) values (new.id);
  insert into public.settings   (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
--  Row-Level Security
--  Default: deny everything. Then narrow policies grant exactly what
--  an authenticated user needs against their own rows.
-- ─────────────────────────────────────────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.user_state   enable row level security;
alter table public.settings     enable row level security;
alter table public.jars         enable row level security;
alter table public.transactions enable row level security;
alter table public.insights     enable row level security;

-- profiles
create policy "profiles: read own"      on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own"    on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: insert own"    on public.profiles for insert with check (auth.uid() = id);

-- user_state
create policy "user_state: read own"    on public.user_state for select using (auth.uid() = user_id);
create policy "user_state: update own"  on public.user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_state: insert own"  on public.user_state for insert with check (auth.uid() = user_id);

-- settings
create policy "settings: read own"      on public.settings for select using (auth.uid() = user_id);
create policy "settings: update own"    on public.settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings: insert own"    on public.settings for insert with check (auth.uid() = user_id);

-- jars
create policy "jars: read own"          on public.jars for select using (auth.uid() = user_id);
create policy "jars: insert own"        on public.jars for insert with check (auth.uid() = user_id);
create policy "jars: update own"        on public.jars for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "jars: delete own"        on public.jars for delete using (auth.uid() = user_id);

-- transactions
create policy "txn: read own"           on public.transactions for select using (auth.uid() = user_id);
create policy "txn: insert own"         on public.transactions for insert with check (auth.uid() = user_id);
create policy "txn: update own"         on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "txn: delete own"         on public.transactions for delete using (auth.uid() = user_id);

-- insights
create policy "insights: read own"      on public.insights for select using (auth.uid() = user_id);
create policy "insights: insert own"    on public.insights for insert with check (auth.uid() = user_id);
create policy "insights: update own"    on public.insights for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "insights: delete own"    on public.insights for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────
--  Realtime — let the client subscribe to its own jar / txn changes
-- ─────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.jars;
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.insights;
alter publication supabase_realtime add table public.user_state;
