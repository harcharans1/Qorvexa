# Qorvexa AI SaaS

Qorvexa is a clean-light SaaS starter built with Angular, ASP.NET Core Web API, and Supabase Auth/PostgreSQL. It includes a public landing page, sign-in/sign-up and password reset, a protected dashboard, resume editor and PDF export, learning courses, marketing drafts, profile management, and an admin course manager.

## Prerequisites
- Node.js 22+ and npm
- .NET 10 SDK for the API
- A Supabase project (Auth + PostgreSQL)
- A Gemini API key if AI generation is needed

## Run the frontend
```powershell
cd frontend
npm install
npm start
```
Open `http://localhost:4200`.

## Configure Supabase
1. Set the public Supabase URL and publishable/anon key in `frontend/src/environments/environment.ts` and `environment.production.ts`.
2. Run `database/schema.sql` in the Supabase SQL editor for a new project, then optionally run `database/seed.sql` to add sample published courses. Use `database/migrations/001_qorvexa_upgrade.sql` only for an existing Qorvexa database after reviewing it.
3. Configure Supabase Auth site URL and redirect URLs for localhost and your deployed domain.
4. To grant an administrator, use the trusted SQL example at the end of `database/schema.sql` as the database owner. Do not grant roles through browser code.

## Run the backend API
```powershell
cd backend/Qorvexa.Api
dotnet restore
dotnet user-secrets init
dotnet user-secrets set "Supabase:Url" "https://lobubnlgulpkgwohkdiz.supabase.co"
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
dotnet run
```
The local HTTPS profile uses `https://localhost:7033`. If it differs on your machine, update `apiBaseUrl` in the frontend environment files. In production configure `Supabase__Url`, `Gemini__ApiKey`, and `Cors__AllowedOrigins__0` on the API host.

## Deploy frontend
Netlify uses `frontend` as the build base, `npm install && npm run build` as the build command, and `dist/frontend/browser` as the publish directory. The SPA redirect is defined in `netlify.toml`.

## Important limitations
- AI endpoints require a configured Gemini API key and an authenticated Supabase user.
- Course content must be created and published by an administrator.
- Scheduled marketing entries are drafts/planning only; social networks are not automatically published.
- Billing/checkout is not wired to a payment provider.
- Privacy and terms pages are clearly marked as drafts and must be reviewed before public launch.
- Never put Supabase service-role keys or other secrets in Angular source, Git, or public deployment variables.

## Validation
On Windows PowerShell, run `./scripts/verify-windows.ps1` from the repository root. It installs frontend dependencies, builds Angular, restores and builds the .NET API, and stops at the first failure. Third-party provider setup and database integration still need to be tested with your own deployment credentials.
