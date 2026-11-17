## Problem

Pageantry arts (WGI, DCI, BOA) run on seasonal organizations and the educators who staff them. Performers accumulate a record of how those seasons actually felt — housing, food, communication, instruction — and that record usually lives in private chats. MARS is the public archive for it: performers review organizations and staff, the public sees the review, and the author stays off the public payload. Organizations and educators are meant to claim the profiles that name them. The master spec is [project-spec.md](../project-spec.md).

## Constraints

Public clients read published reviews through the `public_reviews` view. That view lists explicit columns and has no `author_id`. Direct `SELECT` on `reviews` is limited to the author or a `super_admin`. Inserts must set `author_id` to `auth.uid()`, require a verified role, and land in `pending_moderation`. There is no author update or delete policy. A trigger rejects role changes unless the caller is already `super_admin`.

KYC files go to the private `kyc-documents` bucket, under a folder named for the uploader, with a 10MB cap and PDF or image types. Approval and publish run through `createAdminClient` in `src/lib/supabase/admin.ts`, which imports `server-only` and reads `SUPABASE_SERVICE_ROLE_KEY` on the server.

The app stack checked in `package.json` is Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, `@supabase/ssr` plus `@supabase/supabase-js`, and `@opennextjs/cloudflare` with Wrangler. Tests are Vitest. Spec text also names Zustand and Google OAuth; neither is installed. Auth actions implement email and password. Hosting in the spec is a Cloudflare Worker, with MX left on Google Workspace. No production hostname is configured in this repo.

Review questions are not one fixed form. Organization, staff, and housing targets take different packs from `src/lib/reviews/master-config.ts`, stored in `reviews.responses` (JSONB). The dictionary is [docs/review-taxonomy.md](./review-taxonomy.md). `org_activity_type` is `dci | wgi`.

## Approach

Phase 1 is the schema in `supabase/migrations`: `profiles` tied to `auth.users`, organizations, staff profiles, housing sites, reviews, and KYC submissions, all with RLS. `handle_new_user` inserts a `visitor` profile. `public_reviews` is created with `security_invoker = false` and granted to `anon` and `authenticated`, so a published row can be read without a table grant that would include `author_id`. Later migrations add activity type, housing, reviewer roles, sections, staff relational fields, and `responses`, and recreate the view with those columns still omitting `author_id`.

Phase 2 is the product loop in the App Router. The homepage calls `searchEntities`, which `ilike`-matches organization names and staff first or last names. A miss links to create-organization or create-staff for any signed-in user. Signup and login are server actions around Supabase email/password. `/verify` uploads a contract or receipt and inserts a `pending` KYC row. `/admin/kyc` is `super_admin` only. `approveKyc` marks the submission approved and sets the profile role to `verified_performer`. `createReview` validates the pack, inserts `pending_moderation`, and stores `author_id` from the server-side profile. `publishReview` sets `status` to `published`. Org, staff, and housing pages load scores with `getTargetAggregates` and list cards from `getPublicReviewsForTarget`, both against `public_reviews`. `toPublicReview` copies the public columns, and `src/lib/reviews/dto.test.ts` asserts the payload has no `author_id`. The admin pending-review query selects the same public fields and leaves `author_id` off that list.

`score_overall` and `score_demand` stay as real columns with 1–5 checks so `aggregateReviews` can average them without unpacking JSON. Tag cardinality is capped at three in the database and again in validation.

## Trade-offs

One `reviews` row is the source of truth, and the view’s column list is the public boundary. `security_invoker = false` lets the view read published rows the caller could not select from the table. That is safe only while the view keeps an explicit column list and `where status = 'published'`. A `select *` on that view would publish `author_id`.

Publish is a human step. Unreviewed text stays off the feed, and the first admin is a SQL update of `profiles.role`. The `flagged` status exists on the enum and has no action in the UI. Admin writes use the service-role client after an application role check. RLS would already allow a `super_admin` session to update those rows; the service role is a second path with a wider blast radius, held in by `server-only`.

JSONB packs match a taxonomy that changes by circuit, role, and section. The database checks the denormalized scores, the season year, and tag count. Pack shape is enforced in `validateDynamicReview` on the server action. Insert RLS does not re-check each JSON field.

Directory search uses `ilike`. The migrations also create GIN `to_tsvector` indexes on names, and the search path does not query them. Any authenticated user can insert an organization or staff row, which is how a search miss becomes a page, and it accepts names nobody has reviewed. `claimed_by` and `is_verified` are on the tables. Update policies allow the claimant or a super admin to write. No claim screen sets `claimed_by`.

Target aggregates load every published score row for that target into the Worker. The paged feed uses a separate query and does not average from the current page.

## Result

The loop in the README is what the code does: search, email signup, KYC upload, admin approval to `verified_performer`, review insert as `pending_moderation`, admin publish, public read via `public_reviews` without `author_id`. Local entry points are `npm run dev` and `npm test`. `npm run preview` and `npm run deploy` run the OpenNext Cloudflare build. This repo does not record a deployed URL. Google sign-in, profile claim, and a flag action remain spec or schema, not screens. Brand tokens and the three marketing motions live in the app shell and are described in [docs/brand-mars.md](./brand-mars.md).

## What I'd do next

Add the claim flow the policies already describe: a verified org admin sets `claimed_by`, and a super admin sets `is_verified`. Add a flag action that writes `review_status = 'flagged'` and drops the row out of `public_reviews`. Point name search at the GIN indexes, or remove the indexes. Add a BOA activity type when that circuit needs its own question pack in the master config. Add Google OAuth when Workspace admin login is required; email and password are the auth actions that exist now. Move `getTargetAggregates` into SQL when a target’s published set is too large to pull into the Worker for an average. On deploy, keep MX on Google Workspace and attach only the app hostname to the Worker. Keep new public queries on `public_reviews`.
