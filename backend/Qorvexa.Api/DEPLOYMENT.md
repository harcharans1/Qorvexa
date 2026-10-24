# API deployment settings

Required configuration:

- `Supabase__Url`: `https://lobubnlgulpkgwohkdiz.supabase.co` (already set as the non-secret default in `appsettings.json`; verify it matches your intended Supabase project)
- `Gemini__ApiKey`: server-side Gemini key
- `Cors__AllowedOrigins__0`: exact frontend origin, `https://qorvexaa.netlify.app`

Never commit secrets to `appsettings*.json`. For local development use `dotnet user-secrets`. AI endpoints require a Supabase bearer token from an authenticated user. The API uses Supabase Auth's issuer metadata/JWKS; use a Supabase project configured with standard JWT verification support. Health checks: `/health` and `/api/health`.
