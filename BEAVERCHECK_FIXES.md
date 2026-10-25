# BeaverCheck audit remediation

Applied source/config changes for the five findings in the supplied report:

- Added a Content-Security-Policy response header with explicit origins used by the Angular frontend, Google Fonts, Supabase, and the Qorvexa API.
- Added a Netlify Edge Function that allows known Angular routes and returns HTTP 404 for unknown page paths, while leaving asset paths and Netlify internals alone.
- Disabled production source maps in `frontend/angular.json`.
- Added Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers. COEP is set to `credentialless` to be less disruptive than `require-corp`.

## Validation required before treating as resolved

Deploy to Netlify and test login/signup, Supabase requests, Google Fonts, API calls, and any popup/redirect auth flow. Then re-run BeaverCheck. Confirm that old `.map` files are no longer served after the deploy (clear/deploy cache if needed). CSP/COEP can expose integrations or resources not represented in this report, so the live scan and browser console must be checked.
