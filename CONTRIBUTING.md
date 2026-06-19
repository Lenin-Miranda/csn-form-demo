# Contributing

Thanks for improving CSN Intake Demo. This project is small on purpose, so contributions should keep the student intake flow simple, reliable, and easy to run locally.

## Local Setup

1. Install dependencies:

```bash
npm install --prefix apps/api
npm install --prefix apps/web
```

2. Copy environment templates:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start Supabase:

```bash
npx supabase start
```

4. Start the apps:

```bash
npm run api:dev
npm run web:dev
```

## Before Opening a Pull Request

Run the full verification suite from the repository root:

```bash
npm run verify
```

If you only touched one side of the app, these focused commands are also useful:

```bash
npm run api:test
npm run api:build
npm run web:lint
npm run web:build
```

## Pull Request Guidelines

- Keep changes focused and explain the user-facing impact.
- Add or update tests when changing business logic.
- Do not commit real secrets, service role keys, or local database dumps.
- Keep database changes in `supabase/migrations`.
- Update `README.md` when setup, commands, or behavior changes.

