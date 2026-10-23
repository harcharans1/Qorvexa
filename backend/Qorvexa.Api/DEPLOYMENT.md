# API deployment settings

Required configuration:

- `Supabase__Url`: `https://YOUR_PROJECT_REF.supabase.co`
- `Gemini__ApiKey`: server-side Gemini key
- `Cors__AllowedOrigins__0`: exact frontend origin, e.g. `https://your-site.netlify.app`

Never commit secrets to `appsettings*.json`. For local development use `dotnet user-secrets`. AI endpoints require a Supabase bearer token from an authenticated user. The API uses Supabase Auth's issuer metadata/JWKS; use a Supabase project configured with standard JWT verification support. Health checks: `/health` and `/api/health`.
