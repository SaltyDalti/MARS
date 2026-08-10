-- Dynamic review packs: activity types, housing sites, JSONB responses

create type public.org_activity_type as enum ('dci', 'wgi');

alter table public.organizations
  add column if not exists activity_type public.org_activity_type;

-- Backfill existing seeded orgs as DCI-style by default
update public.organizations
set activity_type = 'dci'
where activity_type is null;

alter table public.organizations
  alter column activity_type set default 'dci';

alter table public.organizations
  alter column activity_type set not null;

-- Housing / gym sites rated by corps
create table if not exists public.housing_sites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  claimed_by uuid references public.profiles (id) on delete set null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists housing_sites_name_idx
  on public.housing_sites using gin (to_tsvector('english', name));

drop trigger if exists housing_sites_set_updated_at on public.housing_sites;
create trigger housing_sites_set_updated_at
  before update on public.housing_sites
  for each row execute function public.set_updated_at();

alter table public.housing_sites enable row level security;

create policy "Housing sites are publicly readable"
  on public.housing_sites for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can create housing sites"
  on public.housing_sites for insert
  to authenticated
  with check (true);

create policy "Claimants and super admins can update housing sites"
  on public.housing_sites for update
  to authenticated
  using (claimed_by = auth.uid() or public.is_super_admin())
  with check (claimed_by = auth.uid() or public.is_super_admin());

-- Extend review target enum
alter type public.review_target_type add value if not exists 'housing_site';

alter table public.reviews
  add column if not exists reviewer_roles text[] not null default '{}'::text[],
  add column if not exists sections text[] not null default '{}'::text[],
  add column if not exists responses jsonb not null default '{}'::jsonb;

-- score_demand kept for legacy rows; new writes may mirror environment/demand
comment on column public.reviews.responses is
  'Dynamic score map keyed by Master Configuration field ids';

drop view if exists public.public_reviews;

create or replace view public.public_reviews
with (security_invoker = false)
as
select
  id,
  target_type,
  target_id,
  season_year,
  score_overall,
  score_demand,
  would_recommend,
  tags,
  written_feedback,
  status,
  created_at,
  reviewer_roles,
  sections,
  responses
from public.reviews
where status = 'published';

revoke all on public.public_reviews from public;
grant select on public.public_reviews to anon, authenticated;
