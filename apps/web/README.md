# CSN Intake Web

Next.js frontend for the CSN English Language intake demo.

## Responsibilities

- Render the bilingual student intake experience.
- Load dynamic form questions from the NestJS API.
- Collect one answer at a time with progress state.
- Submit normalized answers to the backend.
- Persist language preference in the browser.

## Local Development

From the repository root:

```bash
npm install --prefix apps/web
cp apps/web/.env.example apps/web/.env.local
npm run web:dev
```

The web app runs on `http://localhost:3000`.

## Commands

```bash
npm run web:dev
npm run web:lint
npm run web:build
```

Or from this directory:

```bash
npm run dev
npm run lint
npm run build
```

## Environment

See `.env.example` for required variables. The frontend calls the backend through `NEXT_PUBLIC_API_URL`.
