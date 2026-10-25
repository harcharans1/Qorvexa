# Qorvexa repair package — applied changes and remaining manual steps

## Applied in this source package
- Repaired the missing closing brace/semicolon in global CSS and added responsive width safeguards.
- Configured Angular unit tests to use Vitest.
- Corrected hashtag whitespace handling.
- Added resume contact fields (name, email, phone, location, LinkedIn, website), persistence, and ATS context.
- Added Modern Pro template styling; PDF export now captures only the resume content, not the Preview heading.
- Lazy-loaded Angular route components and dynamically imports PDF export dependencies.
- Included the course video player when `courses.video_url` is populated.
- Used Brand Kit voice, language, audience, and description in the AI prompt.
- Added a manual “Mark published” status action; this only updates Qorvexa's status and does not post to external social networks.
- Fixed footer About/Pricing links and removed obvious “sample content” footer text.
- Added Node 22 pin, Netlify SPA fallback/security headers, robots.txt, sitemap.xml and Open Graph metadata.
- Replaced duplicate large logo images with one lossless WebP logo.

## Required Supabase steps (not run automatically)
The database is an external service and this package cannot execute SQL against your account. Before applying SQL, take a Supabase backup or confirm your recovery point. In Supabase SQL Editor, run in this order:
1. `database/migrations/001_qorvexa_upgrade.sql`
2. `database/seed.sql`

The migration adds `courses.thumbnail_url` and related schema updates. The seed inserts the sample learning courses/lessons only when matching titles are absent. Review sample course content before exposing it to users.

## Still needs owner-specific configuration/review before public launch
- Confirm `hello@qorvexa.com` is a real mailbox you control, or replace it in `frontend/src/app/shared/footer/footer.html`.
- Have Privacy and Terms pages reviewed for your actual company, jurisdiction, data practices, analytics, retention, AI provider use, and user rights. This package does not claim to provide legal advice or finalized legal policies.
- Admin lesson create/edit/delete UI is not included in this repair pass; current admin UI still focuses on course create/publish.
- External social-network publishing and analytics remain unconnected. “Mark published” is an internal status only.
- Build/test verification could not complete in this environment because `npm ci` did not finish before the package-install timeout. Run `cd frontend && npm ci && npm test && npm run build` locally or in CI before deploying.
- After deploying, test signup/login, Learn course loading, resume save/reload/PDF, AI summary/ATS, marketing generation/draft status, and desktop/mobile layouts with a real test account.
