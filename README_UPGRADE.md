# Qorvexa — updated project setup

This package preserves the existing Angular + ASP.NET Core + Supabase project and adds route protection, safer configuration, guarded AI endpoints, AI resume summary + estimated ATS review, saved marketing drafts, course enrollment/progress, profile/subscription display, and a more complete RLS schema.

## 1. Important security action

The original ZIP had a Supabase key embedded in the Angular source whose JWT payload identified the role as `service_role`. Treat that key as exposed. In Supabase Dashboard, rotate/revoke it if it is valid, and never put a service-role/secret key in Angular, GitHub, Netlify variables used by the browser, or a public ZIP. The updated source removes that hard-coded key. Configure only the Supabase **publishable key** (or legacy anon key) in the Angular environment.

## 2. Configure Supabase

1. Create/open your Supabase project.
2. In `frontend/src/environments/environment.ts`, set `supabaseUrl`, `supabaseAnonKey`, and `apiBaseUrl`.
3. For production, edit `frontend/src/environments/environment.production.ts` too. The Angular production build replaces the development environment file.
4. In Supabase SQL Editor, run `database/schema.sql`.
5. In Authentication → URL Configuration, set the local site URL to `http://localhost:4200` while developing, and add your production domain to allowed redirect URLs.
6. Create an account through the website. A profile and free subscription row are created by the database trigger.
7. To bootstrap the first admin, run the commented SQL at the bottom of `database/schema.sql` after replacing the email with your account email. Run it as the database owner in SQL Editor.

Only published courses are visible to regular users. Admin course writes are restricted by RLS. Users cannot change their own `profiles.role` through the app.

## 3. Run the Angular frontend

Install Node.js 22+ and npm, then:

```powershell
cd frontend
npm ci
npm start
```

Open `http://localhost:4200`. If `npm ci` fails, resolve the npm/network error first. The project build command is `npm run build`.

## 4. Configure and run the C# API

Install the .NET 10 SDK. From the repository root:

```powershell
cd backend/Qorvexa.Api
dotnet restore
dotnet user-secrets set "Supabase:Url" "https://YOUR_PROJECT_REF.supabase.co"
dotnet user-secrets set "Gemini:ApiKey" "YOUR_GEMINI_API_KEY"
dotnet run
```

The HTTPS launch profile uses `https://localhost:7033`; the development environment is preconfigured for `https://localhost:7033/api`. If your terminal prints a different port, update `apiBaseUrl` to that exact HTTPS URL plus `/api`. If the browser reports a local certificate error, run `dotnet dev-certs https --trust` and restart the browser.

In production, configure environment variables on the API host instead of committing secrets:

- `Supabase__Url`
- `Gemini__ApiKey`
- `Cors__AllowedOrigins__0` (your exact frontend origin)

The API validates Supabase bearer tokens, limits AI requests to 20 per minute per client, validates input, and does not return provider error bodies or stack traces to the browser. AI endpoints require a signed-in user. Never use a placeholder JWT signing secret.

## 5. Features included in this update

- Login/signup error handling, password reset request, protected routes, admin route check.
- Supabase configuration separated from source credentials.
- Resume saving scoped to the signed-in owner, AI summary generation, PDF export safeguards, and estimated job-description review endpoint/UI.
- AI marketing captions, error/loading states, copy, and save-draft action.
- Course enrollment, lesson completion, and progress tracking.
- Profile editing and current subscription display.
- Supabase schema for profiles, resumes, courses/lessons, enrollments/progress, marketing drafts/calendar date, subscriptions and payment-event idempotency, plus RLS policies and updated-at triggers.
- Netlify SPA routing preserved.

## 6. What still requires external setup

These features cannot be live until you choose/configure provider accounts and credentials:

- **Real billing/checkout:** the schema supports subscription records and payment event idempotency, but no payment provider has been selected or wired up. Do not mark a plan paid from frontend state. Implement a server-side checkout + signature-verified webhook for your chosen provider (Razorpay/Stripe/etc.) before accepting money.
- **Social publishing/scheduling:** drafts and a scheduled date field are available, but publishing to social networks requires each platform's developer app, OAuth scopes, and approved API access. The current feature saves drafts only.
- **AI:** configure a valid Gemini API key on the backend host. No key is included in the project.
- **Google OAuth:** enable the provider and callback URLs in Supabase Auth before showing it as a working option.
- **Production admin setup:** grant admin role only through trusted SQL/admin tooling; never expose service-role keys to the browser.

## 7. Deployment checklist

1. Run `npm ci` and `npm run build` in `frontend`.
2. Deploy the API separately with HTTPS, Supabase URL, Gemini key, and production CORS origin configured.
3. Set the production frontend environment API URL to the deployed API URL.
4. In Netlify, set build base to `frontend`, build command `npm run build`, publish directory `dist/frontend/browser` (already defined in `netlify.toml`).
5. Add production domain and password reset redirect URL in Supabase Auth settings.
6. Test sign-up/confirmation, sign-in, password reset, route guards, resume create/edit/delete, AI errors and generation, course enrollment/progress, RLS cross-user access, and mobile layout.
7. Test security using two separate user accounts. Ensure one account cannot read or modify another account's resumes, drafts, progress, or profile.

## Important note

This update is a codebase hardening and feature pass, not a claim that third-party services have been live-tested. The execution environment used to prepare the archive did not have a working npm install/network path or the .NET SDK, so run the commands above on your Windows machine and share any first build error for a targeted fix.
