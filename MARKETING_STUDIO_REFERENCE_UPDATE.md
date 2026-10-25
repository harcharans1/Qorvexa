# Qorvexa Marketing Studio UI Update

Updated the Angular Marketing Studio page to match the supplied dashboard reference more closely.

Included:
- Workspace sidebar with Marketing Studio active state and Pro card.
- Gradient hero, platform-inspired artwork, and live statistics based on saved draft records.
- AI content form with platform, content type, tone, audience, language, CTA, and advanced keywords/brand context.
- Platform preview and copy actions.
- Saved Drafts, Content Planner, Brand Kit, Analytics, and Campaigns tabs.
- Existing Supabase `marketing_drafts` save/load/delete flow retained.
- Brand Kit preferences are saved in this browser's localStorage.
- Angular `anyComponentStyle` budget adjusted to allow the new page stylesheet.

Limitations:
- Social media automatic publishing is not connected.
- Live reach/click/engagement analytics are not available without social platform integrations; the UI explicitly avoids inventing them.
- Brand Kit preferences are local to the browser, not synced to Supabase.
- A production Angular build could not be verified in this environment because dependency installation timed out and `ng` was unavailable. Run `npm ci` and `npm run build` on the developer machine before pushing.
