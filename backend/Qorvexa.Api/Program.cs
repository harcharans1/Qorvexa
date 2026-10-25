using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
// Rate limit per signed-in user (falls back to IP), so one heavy user cannot block everyone else.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("ai", httpContext =>
    {
        var key = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? httpContext.User.FindFirstValue("sub")
                  ?? httpContext.Connection.RemoteIpAddress?.ToString()
                  ?? "anonymous";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 20,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});

// Keep the known production frontend origin in the fallback so a missing optional
// CORS setting does not silently make the deployed SPA unable to call this API.
// Production deployments should still set Cors__AllowedOrigins__0 explicitly.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] { "https://qorvexaa.netlify.app", "http://localhost:4200" };
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
    policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

var supabaseUrl = builder.Configuration["Supabase:Url"]?.TrimEnd('/');
if (string.IsNullOrWhiteSpace(supabaseUrl) || supabaseUrl.Contains("YOUR_PROJECT_REF", StringComparison.OrdinalIgnoreCase))
    throw new InvalidOperationException("Configure Supabase:Url before starting the API. Use dotnet user-secrets locally or Supabase__Url in production.");

// Supabase signs access tokens either with asymmetric keys (published as JWKS) or, on older
// projects, with the legacy shared JWT secret. Support both so sign-in tokens always validate.
var jwtSecret = builder.Configuration["Supabase:JwtSecret"];
var jwksCache = new SupabaseJwksCache($"{supabaseUrl}/auth/v1/.well-known/jwks.json");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = $"{supabaseUrl}/auth/v1",
        ValidateAudience = true,
        ValidAudience = "authenticated",
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.FromMinutes(1),
        IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
        {
            var keys = new List<SecurityKey>(jwksCache.GetKeys(kid));
            if (!string.IsNullOrWhiteSpace(jwtSecret))
                keys.Add(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)));
            return keys;
        }
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");
app.Run();

/// <summary>Small cached loader for the Supabase JWKS endpoint.</summary>
internal sealed class SupabaseJwksCache
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(10) };
    private readonly string _url;
    private readonly object _gate = new();
    private IList<SecurityKey> _keys = new List<SecurityKey>();
    private DateTimeOffset _loadedAt = DateTimeOffset.MinValue;

    public SupabaseJwksCache(string url) { _url = url; }

    public IList<SecurityKey> GetKeys(string? kid)
    {
        lock (_gate)
        {
            var age = DateTimeOffset.UtcNow - _loadedAt;
            var canRetry = age > TimeSpan.FromMinutes(1);
            var stale = age > TimeSpan.FromHours(1);
            var unknownKid = !string.IsNullOrEmpty(kid) && !_keys.Any(k => k.KeyId == kid);
            if (stale || (canRetry && (_keys.Count == 0 || unknownKid))) Load();
            return _keys.ToList();
        }
    }

    private void Load()
    {
        _loadedAt = DateTimeOffset.UtcNow; // set first so a failing endpoint is not hammered
        try
        {
            var json = Http.GetStringAsync(_url).GetAwaiter().GetResult();
            _keys = new JsonWebKeySet(json).GetSigningKeys();
        }
        catch
        {
            // Keep any previously loaded keys; the request will fail validation with 401 if none match.
        }
    }
}
