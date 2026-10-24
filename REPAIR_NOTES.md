# Qorvexa repair notes

## Applied in this package
- Set the backend's non-secret Supabase project URL to match the Angular frontend configuration.
- Added the deployed Netlify origin to the backend CORS allow-list (and retained localhost for development). Explicit Render environment configuration should still be checked after deploy.
- Hardened the frontend API client: requires a valid configured API URL and authenticated session, adds a 30-second timeout, handles non-JSON errors, and provides clearer messages for expired sessions, unavailable AI configuration, and network/CORS failures.
- Made navbar initial authentication loading resilient to lookup errors and registered the auth-state listener before the initial lookup.

## Still requires your account / deployment access
- Set `Gemini__ApiKey` as a secret environment variable in Render. Never add this key to Angular environment files or Git.
- Confirm Render uses the current repository and builds with the included .NET 10 Dockerfile.
- Run `database/schema.sql` in the matching Supabase project if it has not already been applied; if it has, inspect the tables and policies instead of blindly rerunning it.
- Configure Supabase Site URL and redirect URLs for `https://qorvexaa.netlify.app`.
- Build and test the frontend and backend after deployment; dependency installation and the full builds could not be completed in this restricted environment.
- Payments and social-platform publishing are not implemented end-to-end; they require a payment provider and platform OAuth applications.

## Validation limitation
The archive was inspected statically. `npm ci` timed out and the Angular CLI was unavailable, and outbound network access was unavailable for live HTTP checks. This package must still pass `npm ci && npm run build` and `dotnet build` in a networked environment before production deployment.
