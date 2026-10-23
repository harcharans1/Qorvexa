using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Qorvexa.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public IActionResult Get() => Ok(new { status = "ok", service = "Qorvexa API", utc = DateTimeOffset.UtcNow });
}
