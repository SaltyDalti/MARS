-- MARS Phase 1 schema: enums, tables, RLS, KYC storage, public_reviews view

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum (
  'visitor',
  'verified_performer',
  'verified_org_admin',
  'super_admin'
);

create type public.review_target_type as enum (
  'organization',
  'staff'
);

create type public.review_status as enum (
  'pending_moderation',
  'published',
  'flagged'
);

create type public.kyc_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users) — create before helper functions that reference it
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'visitor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Helper: current user's role
-- ---------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'visitor');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  division text,
  claimed_by uuid references public.profiles (id) on delete set null,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organizations_name_idx on public.organizations using gin (to_tsvector('english', name));

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- staff_profiles
-- ---------------------------------------------------------------------------
create table public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  claimed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_profiles_name_idx on public.staff_profiles
  using gin (to_tsvector('english', first_name || ' ' || last_name));

create trigger staff_profiles_set_updated_at
  before update on public.staff_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  target_type public.review_target_type not null,
  target_id uuid not null,
  author_id uuid not null references public.profiles (id) on delete restrict,
  season_year integer not null
    check (season_year >= 1970 and season_year <= 2100),
  score_overall integer not null check (score_overall between 1 and 5),
  score_demand integer not null check (score_demand between 1 and 5),
  would_recommend boolean not null,
  tags text[] not null default '{}'::text[]
    check (cardinality(tags) <= 3),
  written_feedback text,
  status public.review_status not null default 'pending_moderation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_target_idx on public.reviews (target_type, target_id);
create index reviews_status_idx on public.reviews (status);
create index reviews_author_idx on public.reviews (author_id);

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- kyc_submissions
-- ---------------------------------------------------------------------------
create table public.kyc_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,
  status public.kyc_status not null default 'pending',
  admin_notes text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kyc_submissions_user_idx on public.kyc_submissions (user_id);
create index kyc_submissions_status_idx on public.kyc_submissions (status);

create trigger kyc_submissions_set_updated_at
  before update on public.kyc_submissions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- public_reviews view — NEVER exposes author_id
-- security_invoker = false so the view can read published rows without
-- granting table-level SELECT (which would leak author_id) to anon clients.
-- ---------------------------------------------------------------------------
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
  created_at
from public.reviews
where status = 'published';

revoke all on public.public_reviews from public;
grant select on public.public_reviews to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.reviews enable row level security;
alter table public.kyc_submissions enable row level security;

-- profiles
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_super_admin())
  with check (id = auth.uid() or public.is_super_admin());

-- Prevent non–super-admins from escalating their own role
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not exists (
       select 1 from public.profiles
       where id = auth.uid() and role = 'super_admin'
     )
  then
    raise exception 'Only super_admin can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- organizations: public read; authenticated can insert (UGC); claim/verify later
create policy "Organizations are publicly readable"
  on public.organizations for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can create organizations"
  on public.organizations for insert
  to authenticated
  with check (true);

create policy "Claimants and super admins can update organizations"
  on public.organizations for update
  to authenticated
  using (claimed_by = auth.uid() or public.is_super_admin())
  with check (claimed_by = auth.uid() or public.is_super_admin());

-- staff_profiles
create policy "Staff profiles are publicly readable"
  on public.staff_profiles for select
  to anon, authenticated
  using (true);

create policy "Authenticated users can create staff profiles"
  on public.staff_profiles for insert
  to authenticated
  with check (true);

create policy "Claimants and super admins can update staff profiles"
  on public.staff_profiles for update
  to authenticated
  using (claimed_by = auth.uid() or public.is_super_admin())
  with check (claimed_by = auth.uid() or public.is_super_admin());

-- reviews: authors cannot update/delete after insert
-- Direct SELECT on reviews table is restricted so author_id is not readable
-- by the public client. Public reads go through public_reviews view.
create policy "Authors can see own reviews"
  on public.reviews for select
  to authenticated
  using (author_id = auth.uid() or public.is_super_admin());

create policy "Verified performers can insert reviews"
  on public.reviews for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and public.current_user_role() in (
      'verified_performer',
      'verified_org_admin',
      'super_admin'
    )
    and status = 'pending_moderation'
  );

create policy "Only super admins can update reviews"
  on public.reviews for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Only super admins can delete reviews"
  on public.reviews for delete
  to authenticated
  using (public.is_super_admin());

-- kyc_submissions
create policy "Users can view own KYC submissions"
  on public.kyc_submissions for select
  to authenticated
  using (user_id = auth.uid() or public.is_super_admin());

create policy "Users can insert own KYC submissions"
  on public.kyc_submissions for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'pending');

create policy "Only super admins can update KYC submissions"
  on public.kyc_submissions for update
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- ---------------------------------------------------------------------------
-- Storage: private KYC bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "Users can upload own KYC documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own KYC documents"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_super_admin()
    )
  );

create policy "Users can update own pending KYC documents"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own KYC documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'kyc-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_super_admin()
    )
  );
