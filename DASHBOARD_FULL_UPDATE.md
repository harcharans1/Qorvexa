# Qorvexa Dashboard Full Update

The dashboard UI has been redesigned with a premium light blue/purple theme. Existing Angular routes and Supabase client/auth are retained.

## Included
- User greeting and profile data from the authenticated Supabase user/profile.
- Live counts for resumes, enrollments, completed lessons, marketing drafts, planned drafts and published drafts.
- Recent activity from the user's saved resumes and marketing drafts.
- Search across recent activity.
- Workspace update popover based on actual recent saved items.
- Quick links to existing Resume, Learn, Marketing, Profile, Products and Pricing routes.
- Responsive layout and an optional locally remembered dark theme.
- Plan label from the user's subscription row, defaulting to Free when no active plan is found.

## Build and test
From `frontend/` run:

```powershell
npm ci
npm run build
```

Test while signed in with an account that has rows in `resumes`, `enrollments`, `lesson_progress`, `marketing_drafts`, and `subscriptions`. Empty tables should show zero rather than fabricated metrics. Recent activity currently uses real resume and marketing draft records; courses are represented in the learning metrics.

Note: Angular build was not verified in this execution environment because `npm ci` timed out. Verify locally before pushing to production. ATS review count and AI-credit usage are not shown as numeric metrics because this project schema does not currently provide a verified usage table for them.
