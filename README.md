# CSN Intake Demo

Demo app for a better College of Southern Nevada intake flow.

This repo currently has:

- `apps/web`: Next.js frontend
- `apps/api`: NestJS backend
- `supabase/`: local Supabase project, migrations, and seed files

The current data model is relational:

- `students`
- `submissions`
- `submissions.student_id -> students.id`

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop running

Supabase CLI is not required globally because we run it through `npx`.

## Project Structure

```text
.
├── apps
│   ├── api
│   └── web
└── supabase
```

## First-Time Setup

Install dependencies for each app:

```bash
cd apps/api
npm install

cd ../web
npm install
```

Then go back to the repo root:

```bash
cd ../..
```

## Environment Variables

### Backend

Copy the backend env template:

```bash
cp apps/api/.env.example apps/api/.env
```

Set these values in `apps/api/.env`:

```env
PORT=3001
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=your-local-secret-key
```

### Frontend

Copy the frontend env template:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Set these values in `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

You get the local publishable and secret keys from:

```bash
npx supabase status
```

## Running Everything Locally

Use 3 terminals.

### Terminal 1: Supabase

From the repo root:

```bash
npx supabase start
```

Important local services:

- Supabase API: `http://127.0.0.1:54321`
- Supabase Studio: `http://127.0.0.1:54323`
- Local Postgres: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

If you need the current local keys again:

```bash
npx supabase status
```

### Terminal 2: Backend

```bash
cd apps/api
npm run dev
```

Backend runs on:

- `http://localhost:3001` if `PORT=3001` is present in `apps/api/.env`
- otherwise it falls back to `http://localhost:8090`

### Terminal 3: Frontend

```bash
cd apps/web
npm run dev
```

Frontend runs on:

- `http://localhost:3000`

## Useful Commands

### Supabase

Start local stack:

```bash
npx supabase start
```

Show URLs and keys:

```bash
npx supabase status
```

Stop local stack:

```bash
npx supabase stop
```

Reset local DB and re-run all migrations:

```bash
npx supabase db reset
```

Create a new migration:

```bash
npx supabase migration new your_migration_name
```

### Backend

```bash
cd apps/api
npm run dev
npm run build
npm test
```

### Frontend

```bash
cd apps/web
npm run dev
npm run build
npm run lint
```

## Current Backend Endpoints

### `POST /students`

Creates a student.

Example body:

```json
{
  "name": "Lenin Miranda",
  "email": "lenin@example.com",
  "phone": "(702) 555-1234"
}
```

### `POST /submissions`

Current intake endpoint.

This endpoint accepts the full intake payload, finds or creates a student, then creates a related submission.

Example body:

```json
{
  "name": "Lenin Miranda",
  "email": "lenin@example.com",
  "phone": "(702) 555-1234",
  "program": "Computer Science"
}
```

## Validation

NestJS global `ValidationPipe` is enabled in `apps/api/src/main.ts`.

That means:

- unexpected fields are rejected
- DTO validation runs automatically
- invalid payloads return `400 Bad Request`

## Database Notes

Current migrations live in `supabase/migrations`.

The current schema is:

- `students`
  - `id`
  - `name`
  - `email`
  - `phone`
  - `created_at`

- `submissions`
  - `id`
  - `student_id`
  - `program`
  - `created_at`

RLS is enabled on both tables.

Right now the intended flow is:

- frontend calls backend
- backend uses `SUPABASE_SECRET_KEY`
- frontend does not write directly to the tables

## Production Notes

For production:

- use a hosted Supabase project
- replace local env values with production values
- keep `SUPABASE_SECRET_KEY` only in the backend
- never expose the secret key in the frontend

When pushing schema changes to a hosted Supabase project:

```bash
npx supabase link --project-ref your-project-ref
npx supabase db push
```
