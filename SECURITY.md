# Security Policy

## Supported Versions

This demo is currently developed from the `main` branch. Security fixes should target `main` unless a maintainer says otherwise.

## Reporting a Vulnerability

Please do not open a public issue for suspected vulnerabilities. Contact the project maintainer or project lead privately and include:

- A clear description of the issue.
- Steps to reproduce it.
- The affected app or component.
- Any logs, screenshots, or proof of concept details that help verify the report.

## Sensitive Data Guidelines

- Never commit real Supabase service role keys, production credentials, student records, or exported database data.
- Use `.env.example` files for placeholders only.
- Keep writes to Supabase behind the NestJS API unless a change intentionally introduces a reviewed client-side policy.
- Treat submissions, emails, phone numbers, and student notes as private data.

