const staticRoutes = new Set([
  "/", "/products", "/features", "/pricing", "/about",
  "/login", "/signup", "/reset-password", "/dashboard",
  "/resume", "/resume/new", "/learn", "/marketing", "/profile",
  "/admin", "/privacy", "/terms"
]);

function isKnownAppRoute(pathname: string): boolean {
  if (staticRoutes.has(pathname)) return true;
  // Dynamic Angular routes. IDs are single URL path segments.
  if (/^\/resume\/[^/]+$/.test(pathname)) return true;
  if (/^\/learn\/[^/]+$/.test(pathname)) return true;
  return false;
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD") return context.next();
  // Let static assets and Netlify internals continue through the normal pipeline.
  if (url.pathname.includes(".") || url.pathname.startsWith("/.netlify/")) return context.next();
  if (isKnownAppRoute(url.pathname.replace(/\/$/, "") || "/")) return context.next();

  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Qorvexa</title><meta name="robots" content="noindex,follow"><style>body{font-family:system-ui,sans-serif;margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f9ff;color:#172033}.card{max-width:560px;padding:40px;text-align:center}a{display:inline-block;margin-top:16px;padding:12px 20px;border-radius:12px;background:#4338ca;color:white;text-decoration:none}</style></head><body><main class="card"><h1>Page not found</h1><p>The page you’re looking for doesn’t exist or may have moved.</p><a href="/">Return to Qorvexa</a></main></body></html>`, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
};
