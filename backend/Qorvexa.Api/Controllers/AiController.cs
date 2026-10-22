using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;

namespace Qorvexa.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _http = new();

    public AiController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("caption")]
    public async Task<IActionResult> GenerateCaption([FromBody] CaptionRequest req)
    {
        try
        {
            var apiKey = _config["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                return Ok(new { caption = "[Demo] Gemini key not set." });
            }

          var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
            var body = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = $"Write a short {req.Tone} caption for {req.Platform} about: {req.Topic}" } } }
                }
            };

            var response = await _http.PostAsJsonAsync(url, body);
            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return Ok(new { caption = $"API Error ({response.StatusCode}): {raw}" });
            }

            using var doc = JsonDocument.Parse(raw);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return Ok(new { caption = text ?? "Empty response" });
        }
        catch (Exception ex)
        {
            return Ok(new { caption = "Error: " + ex.Message });
        }
    }
}

public class CaptionRequest
{
    public string Topic { get; set; } = "";
    public string Tone { get; set; } = "Professional";
    public string Platform { get; set; } = "LinkedIn";
}