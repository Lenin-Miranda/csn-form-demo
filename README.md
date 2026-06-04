## Supabase local + production

This repo is now scaffolded to use the official Supabase local workflow with Docker through the CLI.

### Recommended setup

- Local development: run Supabase locally with Docker.
- Production: use a hosted Supabase project.
- App code: switch environments only through env vars, not code changes.

### 1. Start Supabase locally

From the repo root:

```bash
npx supabase start
```

Useful commands:

```bash
npx supabase status
npx supabase stop
```

Default local URLs from the Supabase stack:

- API URL: `http://127.0.0.1:54321`
- DB URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- Studio: `http://127.0.0.1:54323`

`npx supabase status` will also print the local publishable key and secret key.

### 2. Environment variables

Frontend (`apps/web`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Backend (`apps/api`):

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` is supported as a legacy fallback

Copy the example files and fill them with either local or production values:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

### 3. Local vs production flow

Use local Supabase for development and schema changes. When a schema change is ready:

```bash
npx supabase migration new your_change_name
```

Then link the repo to your hosted project and push the migrations:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```

That gives you:

- local DB for development
- hosted DB for production
- one migration history shared between both

### 4. App usage

- `apps/web/lib/supabase/client.ts` is the browser-safe client.
- `apps/api/src/supabase/supabase.service.ts` is the server-side Nest service.

Frontend should only use the publishable key. Backend-only actions should use the secret key.
