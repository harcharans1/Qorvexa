# Qorvexa AI SaaS

Qorvexa is a clean-light AI SaaS starter with an Angular frontend, ASP.NET Core Web API, and Supabase Auth/PostgreSQL.

## Quick start

1. Follow **[README_UPGRADE.md](README_UPGRADE.md)** to configure Supabase, the API and Netlify.
2. Frontend: `cd frontend`, `npm ci`, then `npm start`.
3. API: `cd backend/Qorvexa.Api`, set `Supabase:Url` and `Gemini:ApiKey` with `dotnet user-secrets`, then run `dotnet run`.
4. Run `database/schema.sql` for a new database, or `database/migrations/001_qorvexa_upgrade.sql` for an existing Qorvexa database.

## Implemented in this update

- Supabase key removed from Angular source; environment-based public configuration.
- Authentication route guards and admin route guard.
- Password reset flow, owner-scoped resume access and save error handling.
- Authenticated/rate-limited AI endpoints for marketing captions, resume summaries and estimated ATS review.
- Marketing draft save/list/delete and planned date field.
- Course enrollment, lesson completion and progress tracking.
- Profile/subscription display, safer database role policies, schema migration and CI workflow.

## External setup still required

Supabase project keys and Auth URLs, a Gemini API key, and deployment environment variables must be supplied by the project owner. Payment checkout and automatic social network publishing are not enabled: those require selecting a provider and configuring provider credentials, callbacks/webhooks, and platform OAuth access. Read the setup guide before deployment.
