create table if not exists public.fixture_overrides (
  fixture_id text primary key,
  team_a text,
  team_b text,
  round text,
  venue text,
  kickoff_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.fixture_overrides enable row level security;

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
