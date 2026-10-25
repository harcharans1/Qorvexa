# Qorvexa Premium Frontend Update

This update polishes the existing Angular frontend while preserving its route structure and Supabase authentication/data access patterns.

## Pages polished in this update
- Home: existing responsive AI SaaS landing page retained.
- Dashboard: existing account-driven workspace overview retained.
- Resume list/editor: existing workspace retained.
- Learning course list: existing course catalogue retained.
- Course detail: redesigned responsive course page, enrollment and lesson progress actions retained.
- Marketing Studio: existing content generation/drafts/planning interface retained.
- Login/signup/reset password: polished shared visual style; added explicit input labels and autocomplete metadata.
- Profile: redesigned profile and subscription view; save action continues to update Supabase Auth metadata and profile record.
- Products/features/pricing/about info pages: redesigned reusable premium layout.
- Admin: polished course management styles; existing admin guard and CRUD handlers retained.
- Privacy/terms: styled, but content remains a draft and needs a qualified legal review before public use.

## Build and deploy
From `frontend/`:

```powershell
npm ci
npm run build
```

Then deploy the generated Angular browser output using the repository's existing Netlify configuration.

## Important verification notes
- Build and live production interactions must be verified on the developer's machine because dependency installation did not complete in the authoring environment.
- Supabase URL and anon/publishable key are browser-visible configuration; never put service-role keys or Gemini API keys in frontend files.
- Course availability depends on Supabase configuration, published course rows, table grants and RLS policies.
- Payment processing, automatic social publishing, and external analytics require provider integrations and cannot be enabled by visual frontend changes alone.
- Legal pages are explicitly drafts and should not be treated as legal advice or final policies.
