# MARS — Marching Arts Review System

Secure, verified performer reviews for pageantry arts (WGI, DCI, BOA).

See [project-spec.md](./project-spec.md) for the master specification and [docs/brand-mars.md](./docs/brand-mars.md) for the visual system.

## Stack

- **App:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Data/Auth:** Supabase (Postgres, RLS, Storage)
- **Host:** Cloudflare Workers via `@opennextjs/cloudflare`
- **DNS:** Cloudflare
- **Mail:** Google Workspace (MX stay on Google)

## Phase status

- **Phase 1:** Schema, RLS, typed clients, OpenNext stubs
- **Phase 2 (current):** Email auth, KYC gate, admin approval, search, reviews, create-missing

## Local development

### 1. Install & env

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` from Supabase → **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable / anon)
- `SUPABASE_SERVICE_ROLE_KEY` (secret / service_role — never commit)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 2. Supabase Auth URL config

Dashboard → **Authentication → URL configuration**:

- **Site URL:** `http://localhost:3000`
- **Redirect URLs:** `http://localhost:3000/**` and `http://localhost:3000/auth/callback`

For solo testing, turn **Confirm email** off under Authentication → Providers → Email (otherwise you must confirm via inbox before sign-in).

### 3. Run the app

```bash
npm run dev
```

- App: http://localhost:3000
- Health: http://localhost:3000/api/health
- Tests: `npm test`

### 4. First-admin bootstrap

1. Sign up at `/signup` and sign in.
2. In Supabase SQL Editor (or ask the agent via Supabase MCP), promote yourself:

```sql
update public.profiles
set role = 'super_admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

3. Open `/admin/kyc` to approve KYC and publish pending reviews.

## Phase 2 product loop

1. **Search** orgs/staff on the homepage (seeded examples: Cavaliers, SCV, Blue Devils).
2. **Sign up** → `/verify` → upload contract/receipt.
3. **Admin** approves KYC → role becomes `verified_performer`.
4. **Write review** from an org/staff page → status `pending_moderation`.
5. **Admin** publishes review → appears on public feed via `public_reviews` (no `author_id`).
6. Search miss → **Create organization** / **Create staff**.

## Security reminders

- Public UI reads **`public_reviews`** only — never expose `reviews.author_id`.
- Service role key is server-only (`src/lib/supabase/admin.ts`).
- Authors cannot edit/delete reviews after insert (RLS).

## Cloudflare + Google Workspace

### DNS

Keep **MX on Google Workspace**. Point the app hostname at the Cloudflare Worker when you deploy.

### Auth redirects (production)

- Site URL: `https://your-production-domain`
- Redirect URLs: production domain + localhost for dev

### Deploy (later)

```bash
npm run preview
npm run deploy
```

Set Worker secrets for Supabase URL/keys.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js local |
| `npm test` | Vitest unit tests |
| `npm run build` | Production build |
| `npm run preview` | OpenNext + Wrangler local |
| `npm run deploy` | Deploy Worker |
