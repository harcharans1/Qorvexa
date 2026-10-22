using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Qorvexa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                     ?? User.FindFirst("sub")?.Value;

        return Ok(new
        {
            message = "You are authenticated!",
            userId = userId,
            email = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst("email")?.Value
        });
    }
}