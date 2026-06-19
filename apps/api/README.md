# CSN Intake API

NestJS backend for the CSN English Language intake demo.

## Responsibilities

- Validate incoming student and submission payloads.
- Load dynamic intake forms and questions from Supabase.
- Find or create student records.
- Persist submissions and answers.
- Queue confirmation email jobs.
- Process email jobs on a scheduled runner.

## Local Development

From the repository root:

```bash
npm install --prefix apps/api
cp apps/api/.env.example apps/api/.env
npm run api:dev
```

The API runs on `http://localhost:3001` when `PORT=3001` is set.

## Commands

```bash
npm run api:dev
npm run api:test
npm run api:build
```

Or from this directory:

```bash
npm run dev
npm test
npm run build
```

## Environment

See `.env.example` for required variables. Local Supabase values come from:

```bash
npx supabase status
```
