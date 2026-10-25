# Fix log (25 Oct 2026)

## Critical
- **AI features all failing**: backend called `gemini-2.5-flash`, which Google shut down on the Gemini Developer API on 16 Oct 2026 (404). Now uses `gemini-3.6-flash`, configurable with `Gemini__Model` (or `Gemini:Model` in appsettings).
- **Marketing Studio "Unsupported tone" (400)**: UI offers Friendly / Innovative / Luxury / Bold, but the API only allowed 5 tones. API now accepts all UI tones. Topic limit raised 1000 -> 4000 because the UI appends brand/audience context to the topic.
- **API login (401) risk**: JWT validation relied on OpenID discovery from Supabase. Replaced with JWKS key loading (new Supabase projects) plus optional `Supabase__JwtSecret` for legacy HS256 projects.

## Frontend
- `href="#products"` / `href="#achievements"` and Marketing sidebar `href="/..."` caused full-page reloads or jumped to the home page. Replaced with `routerLink` (+ fragment).
- Learn hero button used `routerLink` on a button with a click handler; split into a proper link / button.
- Removed duplicate `info.page.ts` (typo copy of `info-page.ts`) and duplicate `import 'zone.js'` (already in angular.json polyfills); added explicit `provideZoneChangeDetection`.
- Sign up with an already-registered email now shows a clear error instead of "check your email".
- Navbar dropdowns close on outside click / Escape.
- Lesson videos (`lessons.video_url`) are now shown on the course page.

## Deployment (Netlify)
- CSP had no `media-src`, so external course videos were blocked. Added `media-src 'self' blob: https:`.
- Removed COOP/COEP headers (not needed, can break embedded media).

## Database
- `courses.video_url` column was missing (UI read it). Added.
- Backfill profile/subscription rows for users created before the signup trigger. Run `database/migrations/002_video_and_profile_backfill.sql` once on your existing Supabase project.

## Not verified here
No network in my sandbox: I could not run `npm install`, `ng build` or `dotnet build`. TypeScript syntax was checked; please run `npm ci && npm run build` and `dotnet build` once on your machine.

# Round 2: premium upgrade and new pages
- `src/premium.css`: global premium layer (gradient buttons, glass navbar, hover lift, scroll-reveal, skeletons, shared `pg-*` page styles).
- New real pages: Features, Pricing (monthly/yearly toggle, comparison table, FAQ, priority list saved to DB), About, Contact (form saved to DB), 404.
- New **Career AI** (`/career`): cover letter, interview prep, LinkedIn bio, follow-up email; copy, download .txt, recent-draft history. Backend endpoint `POST /api/ai/career`.
- Admin panel: tabs for Courses (publish/delete, intro video), Lessons (add/delete), Support messages (read/resolve), Plan requests. Admin link appears in the account menu for admins.
- Run `database/migrations/003_contact_and_plan_requests.sql` once in Supabase (also appended to `schema.sql`).
- Not done yet: real payments (needs Stripe/Razorpay), a full dark theme for all pages, social auto-publishing.
