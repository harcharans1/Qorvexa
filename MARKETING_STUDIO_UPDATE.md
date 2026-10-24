# Qorvexa Marketing Studio Update

## Included
- Premium responsive Marketing Studio workspace with Create Content, Saved Drafts, Content Planner, and Brand Kit tabs.
- Platform, content format, tone, language, campaign goal, target audience, call-to-action, and optional planning date fields.
- AI request passes these options to `POST /api/ai/caption`.
- Backend validates allowed platforms, tones, languages, content types, goals, and field lengths before constructing the generation prompt.
- Preview, regenerate, clipboard copy, save draft, search/filter saved drafts, reuse draft, delete draft, planned post list, and local-browser Brand Kit preferences.
- Drafts continue using the existing `marketing_drafts` Supabase table and current user ownership filter.

## Important production notes
- Deploy the updated ASP.NET Core backend as well as the Angular frontend. An older API build will ignore the additional JSON fields and will not use the new language/goal/audience options.
- This is a content planner, not an automatic publisher. No social media account OAuth, posting permissions, or publishing API is connected.
- Analytics cards are counts derived from saved drafts. They are not social-network engagement metrics.
- Brand Kit preferences are stored in the current browser's localStorage, not synchronized to Supabase.
- Run `npm ci` and `npm run build` from `frontend/`. The build could not be confirmed in this packaging environment because npm dependency installation timed out.
- Backend AI requires the existing server-side `Gemini__ApiKey` configuration. Never put that secret in the frontend.
