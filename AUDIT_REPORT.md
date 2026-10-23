# Qorvexa source audit and repair notes

## Repairs made
- Added missing Angular bootstrap files: `src/main.ts`, `src/index.html`, `src/app/app.ts`, and `src/app/app.config.ts`.
- Repaired the app shell and route table so all route imports resolve.
- Added missing route pages for the landing page, dashboard, resume list, course list, admin course management, and draft legal pages.
- Added missing navbar/footer component classes and all referenced component stylesheets.
- Added Angular package metadata and TypeScript configurations that were missing from the archive.
- Added the ASP.NET Core project file and Dockerfile.
- Added root `.gitignore` rules for `.NET bin/obj`, Node dependencies, build outputs, and local environment secrets.
- Added `netlify.toml` with SPA fallback and the Angular browser output path.
- Updated CI to install npm dependencies without requiring the absent lockfile.
- Removed generated `.NET bin/obj` artifacts and one duplicate image from the source package.
- Added explicit placeholder privacy/terms pages and clarified that these need legal review.

## Needs owner configuration before live use
- Set Supabase public URL + publishable/anon key in both Angular environment files.
- Set `Supabase:Url` and `Gemini:ApiKey` as backend user-secrets/environment variables.
- Run the SQL schema in the correct Supabase project and confirm RLS with two test accounts.
- Add/publish courses using an admin account.
- Configure production API URL, CORS origin, Supabase redirect URLs, and deployment secrets.
- Configure a payment provider before charging users; configure social OAuth before automated publishing.
- Generate and commit `frontend/package-lock.json` by running `npm install` on a networked machine, then use `npm ci` for reproducible installs.

## Validation status
Static references were checked for missing local component templates/styles/imports. A full Angular build and .NET build could not be run in this environment because dependency installation timed out and the .NET SDK is unavailable here. Run the build commands on your Windows machine and address any toolchain-specific errors before deployment.

## Follow-up fixes in this package
- Added reactive navbar auth-state handling and conditional Login/Get Started versus Profile/Logout links.
- Aligned the local Angular environment with the configured public Supabase project and deployed API base URL.
- Added `PRODUCTION_SETUP_CHECKLIST.md` describing the remaining dashboard-side schema, redirect, CORS, Gemini-key and end-to-end test requirements.
- Removed generated .NET `bin/` and `obj/` artifacts from this archive.

The ZIP cannot prove that the Supabase schema has been executed or that Render environment variables are correct; those require dashboard verification and live tests.
