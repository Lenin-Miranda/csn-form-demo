# CSN Intake Demo

![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D20-339933.svg)
![Next.js](https://img.shields.io/badge/web-Next.js%2016-black.svg)
![NestJS](https://img.shields.io/badge/api-NestJS%2011-e0234e.svg)
![Supabase](https://img.shields.io/badge/database-Supabase-3ecf8e.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178c6.svg)

Bilingual English Language intake demo for the College of Southern Nevada. The app gives prospective students a guided one-question-at-a-time intake flow, stores submissions in Supabase, and queues confirmation emails through a NestJS backend.

## Highlights

- Student-facing intake experience built with Next.js App Router.
- NestJS API with DTO validation, CORS configuration, and service boundaries.
- Supabase migrations and seed data for local development.
- Dynamic intake forms and questions backed by relational tables.
- Submission answers stored separately from student records.
- Email job queue with retry/failure states and a no-op mail provider for local development.
- English and Spanish UI copy.

## Stack

| Area | Technology |
| --- | --- |
| Web | Next.js 16, React 19, Tailwind CSS 4 |
| API | NestJS 11, class-validator, scheduled jobs |
| Database | Supabase local stack, PostgreSQL migrations |
| Tooling | TypeScript, ESLint, Jest, GitHub Actions |

## Repository Structure

```text
.
├── apps
│   ├── api          # NestJS backend
│   └── web          # Next.js frontend
├── supabase         # Local Supabase config, migrations, and seed data
├── .github          # CI workflow
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
└── SECURITY.md
```

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop

The Supabase CLI does not need to be installed globally. Commands in this repo use `npx supabase`.

## Quick Start

Install dependencies:

```bash
npm install --prefix apps/api
npm install --prefix apps/web
```

Copy the environment templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Start Supabase from the repository root:

```bash
npx supabase start
```

Copy the local publishable and secret keys from:

```bash
npx supabase status
```

Then start the API and web app in separate terminals:

```bash
npm run api:dev
npm run web:dev
```

Local services:

| Service | URL |
| --- | --- |
| Web app | `http://localhost:3000` |
| API | `http://localhost:3001` |
| Supabase API | `http://127.0.0.1:54321` |
| Supabase Studio | `http://127.0.0.1:54323` |
| Local Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |

## Environment Variables

Backend template: `apps/api/.env.example`

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SECRET_KEY=your-local-secret-key
```

Frontend template: `apps/web/.env.example`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

Do not commit real `.env` files. Only `.env.example` files should be tracked.

## Useful Commands

Run from the repository root:

```bash
npm run api:dev
npm run web:dev
npm run api:test
npm run api:build
npm run web:lint
npm run web:build
npm run verify
```

Supabase commands:

```bash
npx supabase start
npx supabase status
npx supabase db reset
npx supabase stop
npx supabase migration new your_migration_name
```

## API Overview

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/intake` | Load the default intake form and questions. |
| `GET` | `/intake/:formSlug/questions` | Load a specific form by slug. |
| `POST` | `/submissions` | Create a student submission and queue confirmation email. |
| `POST` | `/students` | Create a student directly. |
| `POST` | `/intake/questions` | Create an intake question. Intended for admin workflows. |

Example submission payload:

```json
{
  "formSlug": "student-intake",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "(702) 555-1234",
  "program": "Intensive English Program",
  "answers": [
    {
      "questionId": "00000000-0000-0000-0000-000000000000",
      "value": "Jane Smith"
    }
  ]
}
```

## Database Model

The current schema is relational:

- `students`
- `submissions`
- `intake_forms`
- `intake_questions`
- `submission_answers`
- `email_jobs`

The intended data flow is:

1. The frontend calls the NestJS backend.
2. The backend validates the request.
3. The backend writes to Supabase using `SUPABASE_SECRET_KEY`.
4. The backend queues a confirmation email in `email_jobs`.

Row Level Security is enabled on the Supabase tables. Direct frontend writes are intentionally avoided.

## Quality Checks

GitHub Actions runs API tests/build and web lint/build on pushes to `main` and pull requests.

Before opening a pull request, run:

```bash
npm run verify
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup and pull request guidelines.

## Security

See [SECURITY.md](SECURITY.md) for responsible disclosure and sensitive data guidance.

## License

Released under the [MIT License](LICENSE).
