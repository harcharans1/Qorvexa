using Microsoft.AspNetCore.Mvc;

namespace Qorvexa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            status = "healthy",
            service = "Qorvexa.Api",
            timestamp = DateTime.UtcNow,
            message = "API is running. Database connection will be tested in later phases."
        });
    }
}