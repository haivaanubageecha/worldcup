create table if not exists public.players (
  email text primary key,
  name text not null,
  photo text,
  updated_at timestamptz not null default now()
);

create table if not exists public.predictions (
  email text not null references public.players(email) on delete cascade,
  fixture_id text not null,
  score_a integer not null check (score_a >= 0 and score_a <= 20),
  score_b integer not null check (score_b >= 0 and score_b <= 20),
  saved_at timestamptz not null default now(),
  primary key (email, fixture_id)
);

create table if not exists public.results (
  fixture_id text primary key,
  score_a integer not null check (score_a >= 0 and score_a <= 20),
  score_b integer not null check (score_b >= 0 and score_b <= 20),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixture_overrides (
  fixture_id text primary key,
  team_a text,
  team_b text,
  round text,
  venue text,
  kickoff_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.predictions enable row level security;
alter table public.results enable row level security;
alter table public.fixture_overrides enable row level security;

drop policy if exists "players are publicly readable" on public.players;
create policy "players are publicly readable"
on public.players for select
using (true);

drop policy if exists "players can be upserted by public app" on public.players;
create policy "players can be upserted by public app"
on public.players for insert
with check (true);

drop policy if exists "players can be updated by public app" on public.players;
create policy "players can be updated by public app"
on public.players for update
using (true)
with check (true);

drop policy if exists "predictions are publicly readable" on public.predictions;
create policy "predictions are publicly readable"
on public.predictions for select
using (true);

drop policy if exists "predictions can be upserted by public app" on public.predictions;
create policy "predictions can be upserted by public app"
on public.predictions for insert
with check (true);

drop policy if exists "predictions can be updated by public app" on public.predictions;
create policy "predictions can be updated by public app"
on public.predictions for update
using (true)
with check (true);

drop policy if exists "results are publicly readable" on public.results;
create policy "results are publicly readable"
on public.results for select
using (true);

drop policy if exists "results can be upserted by public app" on public.results;
create policy "results can be upserted by public app"
on public.results for insert
with check (true);

drop policy if exists "results can be updated by public app" on public.results;
create policy "results can be updated by public app"
on public.results for update
using (true)
with check (true);

drop policy if exists "fixture overrides are publicly readable" on public.fixture_overrides;
create policy "fixture overrides are publicly readable"
on public.fixture_overrides for select
using (true);

drop policy if exists "fixture overrides can be upserted by public app" on public.fixture_overrides;
create policy "fixture overrides can be upserted by public app"
on public.fixture_overrides for insert
with check (true);

drop policy if exists "fixture overrides can be updated by public app" on public.fixture_overrides;
create policy "fixture overrides can be updated by public app"
on public.fixture_overrides for update
using (true)
with check (true);

window.WORLD_CUP_BACKEND = {
  supabaseUrl: "https://xvtippumubsmwtzpgwgv.supabase.co",
  supabaseAnonKey: "sb_publishable_yPx9i6x5RDiTWyqpk2e8TQ_Uv_W4k6f"
};
