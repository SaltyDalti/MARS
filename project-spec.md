# MARS (Marching Arts Review System) — Master Specification

## 1. Project Overview

**Mission:** Build a secure, user-generated review platform for the pageantry arts (WGI, DCI, BOA). The platform bridges historical archiving with gig-economy accountability, allowing performers to review organizations and educators.

**Core Philosophy:** Performers review anonymously but are verified on the backend. Organizations and educators can claim profiles.

## 2. Tech Stack Definition

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router, TypeScript) |
| Styling | Tailwind CSS + shadcn/ui |
| Database & Auth | Supabase (PostgreSQL, Row Level Security, Storage for KYC uploads) |
| State Management | React Context / Zustand |
| Deployment | **Cloudflare Workers** via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) + Wrangler |
| Domain / DNS | Cloudflare DNS |
| Email / Workspace | Google Workspace (MX on Google; app domain on Cloudflare) |
| Auth providers (Phase 2+) | Supabase Auth — email/password + Google OAuth (Workspace-friendly for admins) |

> **Note:** An earlier draft targeted Vercel. Production hosting is Cloudflare Workers (OpenNext), not Vercel.

## 3. Database Schema (Supabase / PostgreSQL)

### users / profiles (Managed by Supabase Auth)

`auth.users` is managed by Supabase. Application role and profile data live in `profiles`:

- `id` (UUID, PK, FK → `auth.users`)
- `role` (Enum: `visitor`, `verified_performer`, `verified_org_admin`, `super_admin`)

### organizations

- `id` (UUID)
- `name` (String, e.g., "The Cavaliers")
- `division` (String, e.g., "DCI World Class")
- `claimed_by` (UUID, FK → profiles)
- `is_verified` (Boolean)

### staff_profiles

- `id` (UUID)
- `first_name`, `last_name` (String)
- `claimed_by` (UUID, FK → profiles)

### reviews

- Core: metrics, tags, feedback, status, `author_id` (hidden on frontend)
- Dynamic packs: `reviewer_roles[]`, `sections[]`, `responses` JSONB (Master Configuration field ids)
- See [`docs/review-taxonomy.md`](docs/review-taxonomy.md) and [`src/lib/reviews/master-config.ts`](src/lib/reviews/master-config.ts)

### kyc_submissions (Phase 2 support, schema in Phase 1)

- `id` (UUID)
- `user_id` (UUID, FK → profiles)
- `storage_path` (Text)
- `status` (pending / approved / rejected)
- Admin notes

Public clients read published reviews through a **`public_reviews` view that omits `author_id`**.

## 4. Core User Flows

1. **Public Search (Read-Only):** Homepage search for Organization or Staff; aggregate scores and paginated review cards.
2. **User Verification (KYC):** Account creation → gated wall → upload contract/receipt to Supabase Storage → admin approves → role `verified_performer`.
3. **Review Submission:** Verified performer selects target, 1–5 metrics, up to 3 tags, feedback; RLS prevents edit after submit.
4. **UGC Creation:** Search miss → “Create New” form for org or staff.

## 5. Infrastructure: Cloudflare + Google Workspace

```
User → Cloudflare DNS → Cloudflare Worker (OpenNext Next.js)
                      ↘ Google Workspace MX (mail)
Worker → Supabase (Auth, Postgres, Storage)
```

- Keep **MX records on Google Workspace**; use Cloudflare for the apex/www app DNS and Worker custom domain.
- Configure Supabase Auth redirect URLs for the production Cloudflare domain.
- Google OAuth client (GCP / Workspace admin) for Phase 2 sign-in.

## 6. Cursor Agent Directives (Rules of Engagement)

- **Component Structure:** Functional React components with TypeScript interfaces. Modular (e.g., `ReviewCard` UI separate from `ReviewFeed` data fetcher).
- **Security First:** Enforce Supabase RLS on all tables. Frontend must **NEVER** expose `author_id` of a review to the public API client.
- **Plan Mode:** Before sweeping architectural changes, output a step-by-step markdown plan and wait for human approval.
- **Styling:** Tailwind utility classes. Do not write custom `.css` files unless absolutely necessary.
- **Testing:** Unit tests for API route handlers and complex aggregation utilities **before** implementing the UI.
- **Hosting:** Prefer Cloudflare Workers + OpenNext; do not introduce Vercel-specific config.

## 7. Phased Delivery

| Phase | Scope |
|-------|--------|
| **1 (current)** | Spec, Next.js + Tailwind + shadcn, OpenNext/Wrangler stubs, Supabase schema/RLS/Storage, typed clients, placeholder homepage |
| **2** | Auth, KYC, search, reviews, create-missing, tests then UI, first Cloudflare deploy |
| **3** | Claim flows, admin moderation UI, aggregation hardening, production cutover |
