# Remaining UX & Accessibility Fixes

## Issues addressed
- Added a real `/contact` route; it explains that a backend form is not connected and offers mailto support actions.
- Kept the existing `/login` and `/signup` routes and visible navbar actions; the main Get Started CTAs route to `/signup`.
- Kept the existing Resume PDF export implementation and added a loading/disabled state to prevent repeated clicks while the PDF is being prepared.
- Added global visible keyboard focus, disabled-state affordances, responsive image sizing, and reduced-motion support.
- Kept the native `<details>/<summary>` FAQ pattern, which supports keyboard activation, and added a descriptive accessible label. Pricing and FAQ copy were otherwise not changed.
- Footer already included Contact & Support, Privacy Policy, and Terms of Service links; logo images already had alt text.

## Files changed
- `frontend/src/app/app.routes.ts`: added `/contact` page content with support email actions.
- `frontend/src/app/features/resume/resume-editor/resume-editor.html`: PDF button loading label and disabled state.
- `frontend/src/app/features/resume/resume-editor/resume-editor.ts`: `pdfLoading` state and safe completion handling for PDF export.
- `frontend/src/app/features/home/home/home.html`: descriptive accessible label for native FAQ disclosures; no pricing copy changes.
- `frontend/src/styles.css`: keyboard focus, disabled-state, responsive-image, and reduced-motion rules.

## Manual setup / limitations
- `hello@qorvexa.com` must be verified and monitored by the site owner. Contact uses `mailto:` because no support form backend exists.
- PDF export uses the existing client-side `jspdf` and `html2canvas` path; output is image-based rather than selectable text. Browser download behavior still needs a real browser test.
- Social profile URLs were not present in source, so no fabricated social links were added.
- Live deployment and full end-to-end button testing were not performed as part of this source ZIP update.
