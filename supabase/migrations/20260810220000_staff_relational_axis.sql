-- Staff profile relational axis (who is reviewed × who is reviewing)

alter table public.reviews
  add column if not exists staff_reviewee_role text,
  add column if not exists staff_reviewer_relation text;

comment on column public.reviews.staff_reviewee_role is
  'Primary role of the staff individual during the season (executive, caption_head, instructional_tech, design_staff, tour_ops_admin)';

comment on column public.reviews.staff_reviewer_relation is
  'Reviewer position relative to reviewee (performer_upward, peer_lateral, director_downward)';

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
  staff_reviewee_role,
  staff_reviewer_relation,
  responses
from public.reviews
where status = 'published';

revoke all on public.public_reviews from public;
grant select on public.public_reviews to anon, authenticated;
