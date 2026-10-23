# Qorvexa production setup checklist

## Already configured in this source
- Angular production Supabase URL and public anon key are present in `frontend/src/environments/environment.production.ts`.
- Local development environment uses the same public Supabase project configuration.
- Angular API base URL points to `https://qorvexa-api.onrender.com/api`.
- Navbar now reacts to Supabase auth changes: logged out shows Login + Get Started; logged in shows Profile + Logout.
- SQL schema is included at `database/schema.sql` and enables RLS on application tables.

## Required owner-side steps (cannot be completed by editing this ZIP)
1. In the Supabase dashboard for the project referenced in the environment files, open SQL Editor and run `database/schema.sql` once. Confirm it succeeds. If it was already run, inspect the tables/policies rather than blindly rerunning migrations.
2. In Supabase Authentication settings, set the Site URL to the Netlify production origin and add the production origin plus `http://localhost:4200` to Redirect URLs as appropriate.
3. In Render, verify environment variables: `Supabase__Url` must match the Supabase project URL; `Gemini__ApiKey` must contain the server-side Gemini key; `Cors__AllowedOrigins__0` must exactly match the Netlify origin (no trailing slash). Never put Gemini keys or Supabase service-role keys in the frontend.
4. Redeploy the backend after changing Render variables. Check `/health` and `/api/health`.
5. Build and deploy frontend: from `frontend`, run `npm ci` then `npm run build`; publish `dist/frontend/browser` on Netlify. Ensure Netlify builds from the repository root using `netlify.toml`.
6. Test signup, email confirmation, login, logout, protected pages, course loading, resume save/reload, PDF export, AI summary, ATS review, and marketing caption generation with a test account.

## Key safety note
Supabase project URL and anon/publishable key are designed to be browser-visible. Database access must be protected by correct Row Level Security policies. Never expose the Supabase `service_role` key or Gemini API key in Angular files or browser bundles.
