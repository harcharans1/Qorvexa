# Qorvexa website UX audit fixes

## Findings and changes
- Replaced confusing pricing copy and redundant pseudo-plans with a free plan and an explicit paid-plans Coming soon state. No payment provider is claimed.
- Added visible Contact Us navigation and Contact & Support footer access. `/contact` explains that no backend form is connected and opens an email draft through `mailto:`.
- Made Log In and Sign Up explicit in the guest navigation; Get Started goes to `/signup`.
- Renamed the existing resume editor action to “Download Resume as PDF”; it calls the existing `downloadPdf()` implementation.
- Added SoftwareApplication structured data and retained page title, description, Open Graph, and Twitter metadata.
- Added global visible keyboard focus, reduced-motion preferences, and disabled control styling. FAQ uses native `details`/`summary`, which is keyboard-operable without custom JavaScript.
- Footer includes About, Pricing, Contact & Support, Privacy Policy, and Terms of Service. No social profile URLs were present, so none were invented.

## Files changed
- `frontend/src/app/features/home/home/home.html` — honest pricing presentation.
- `frontend/src/app/features/home/home/home.ts` — pricing FAQ copy.
- `frontend/src/app/shared/navbar/navbar.html` — Log In, Sign Up, Contact Us.
- `frontend/src/app/shared/footer/footer.html` — contact/support and footer links.
- `frontend/src/app/app.routes.ts` — `/contact` route and support content.
- `frontend/src/app/features/resume/resume-editor/resume-editor.html` — PDF action label.
- `frontend/src/app/features/info-page/info-page.html` — `mailto:` support actions open the email handler instead of being treated as app routes.
- `frontend/src/index.html` — structured data and existing SEO metadata.
- `frontend/src/styles.css` — focus, reduced motion, disabled state defaults.

## Manual setup / remaining work
- Confirm `hello@qorvexa.com` is a monitored mailbox; replace it if needed. `mailto:` depends on the visitor having an email handler.
- No contact-form backend, payment provider, or social publishing integration was added.
- Privacy and Terms pages exist as app routes but need final legal review.
- Run `npm ci`, `npm test`, and `npm run build` in `frontend` before deploying. Live deployment was not performed from this archive.
