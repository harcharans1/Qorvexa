using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Qorvexa.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
[EnableRateLimiting("ai")]
public sealed class AiController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiController> _logger;

    public AiController(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<AiController> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpPost("caption")]
    public async Task<IActionResult> GenerateCaption([FromBody] CaptionRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Topic) || request.Topic.Length > 1800)
            return BadRequest(new { message = "Topic and brand context are required and must total 1800 characters or fewer." });
        if (!AllowedPlatforms.Contains(request.Platform)) return BadRequest(new { message = "Unsupported platform." });
        if (!AllowedTones.Contains(request.Tone)) return BadRequest(new { message = "Unsupported tone." });
        if (!AllowedLanguages.Contains(request.Language)) return BadRequest(new { message = "Unsupported language." });
        if (!AllowedContentTypes.Contains(request.ContentType)) return BadRequest(new { message = "Unsupported content format." });
        if (!AllowedGoals.Contains(request.Goal)) return BadRequest(new { message = "Unsupported campaign goal." });
        if (request.Audience?.Length > 180 || request.CallToAction?.Length > 180)
            return BadRequest(new { message = "Audience and call to action must each be 180 characters or fewer." });

        var prompt = $"Create one original social media content piece for platform: {request.Platform}. Format: {request.ContentType}. Brand voice: {request.Tone}. Output language: {request.Language}. Campaign goal: {request.Goal}. Target audience: {(string.IsNullOrWhiteSpace(request.Audience) ? "not specified" : request.Audience)}. Requested call to action: {(string.IsNullOrWhiteSpace(request.CallToAction) ? "choose a suitable natural CTA if appropriate" : request.CallToAction)}. Topic and brand context supplied by user: {request.Topic}. Adapt length and style for the selected platform. Include a few relevant hashtags where suitable. Do not invent facts, claims, statistics, offers, or guarantees not supplied by the user. Return only the finished content.";
        var result = await GenerateText(prompt, cancellationToken);
        return result.Success ? Ok(new { caption = result.Text }) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("resume-summary")]
    public async Task<IActionResult> GenerateResumeSummary([FromBody] ResumeSummaryRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TargetRole) && string.IsNullOrWhiteSpace(request.Skills))
            return BadRequest(new { message = "Provide a target role or skills." });
        if (request.TargetRole?.Length > 160 || request.Skills?.Length > 2000 || request.ExistingSummary?.Length > 3000)
            return BadRequest(new { message = "One or more fields exceed the allowed length." });

        var experience = JsonSerializer.Serialize(request.Experience ?? Array.Empty<object>());
        var education = JsonSerializer.Serialize(request.Education ?? Array.Empty<object>());
        var prompt = $"Write a concise, professional resume summary in first-person implied style, 3-5 sentences. Never invent credentials, dates, achievements or numbers. Target role: {request.TargetRole}. Skills supplied: {request.Skills}. Education supplied (JSON): {education}. Experience supplied (JSON): {experience}. Existing summary for context: {request.ExistingSummary}. Return only the summary.";
        var result = await GenerateText(prompt, cancellationToken);
        return result.Success ? Ok(new { text = result.Text }) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    [HttpPost("ats-review")]
    public async Task<IActionResult> AtsReview([FromBody] AtsReviewRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ResumeText) || string.IsNullOrWhiteSpace(request.JobDescription))
            return BadRequest(new { message = "Resume text and job description are required." });
        if (request.ResumeText.Length > 12000 || request.JobDescription.Length > 12000)
            return BadRequest(new { message = "Resume and job description must each be 12000 characters or fewer." });
        var prompt = $"Compare the resume against the job description. Provide: (1) approximate keyword overlap, (2) missing relevant keywords, (3) formatting/readability suggestions, (4) truthful improvement ideas. Clearly state this is an estimate, not a guaranteed ATS score. Resume: {request.ResumeText}\nJob description: {request.JobDescription}";
        var result = await GenerateText(prompt, cancellationToken);
        return result.Success ? Ok(new { review = result.Text, isEstimate = true }) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    private async Task<AiResult> GenerateText(string prompt, CancellationToken cancellationToken)
    {
        var apiKey = _config["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return AiResult.Fail(StatusCodes.Status503ServiceUnavailable, "AI provider is not configured. Set Gemini__ApiKey on the backend host.");

        try
        {
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={Uri.EscapeDataString(apiKey)}";
            var body = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            using var response = await _httpClientFactory.CreateClient().PostAsJsonAsync(url, body, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Gemini provider returned status {StatusCode}", (int)response.StatusCode);
                return AiResult.Fail(StatusCodes.Status502BadGateway, "AI provider request failed. Check the backend API key and provider quota.");
            }
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var text = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();
            return string.IsNullOrWhiteSpace(text)
                ? AiResult.Fail(StatusCodes.Status502BadGateway, "AI provider returned an empty response.")
                : AiResult.Ok(text.Trim());
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { throw; }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI generation request failed.");
            return AiResult.Fail(StatusCodes.Status502BadGateway, "Could not complete the AI request. Please try again.");
        }
    }

    private static readonly HashSet<string> AllowedPlatforms = new(StringComparer.OrdinalIgnoreCase)
        { "LinkedIn", "Instagram", "X", "Facebook", "TikTok" };
    private static readonly HashSet<string> AllowedTones = new(StringComparer.OrdinalIgnoreCase)
        { "Professional", "Casual", "Funny", "Inspirational", "Educational" };
    private static readonly HashSet<string> AllowedLanguages = new(StringComparer.OrdinalIgnoreCase)
        { "English", "Punjabi", "Hindi", "Hinglish" };
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        { "Caption", "Product promotion", "Educational post", "Launch announcement", "Engagement question", "Short video script", "Content idea" };
    private static readonly HashSet<string> AllowedGoals = new(StringComparer.OrdinalIgnoreCase)
        { "Build brand awareness", "Increase engagement", "Generate leads", "Drive sales", "Educate audience", "Grow followers" };

    public sealed class CaptionRequest
    {
        public string Topic { get; set; } = "";
        public string Tone { get; set; } = "Professional";
        public string Platform { get; set; } = "LinkedIn";
        public string Language { get; set; } = "English";
        public string ContentType { get; set; } = "Caption";
        public string Goal { get; set; } = "Build brand awareness";
        public string? Audience { get; set; }
        public string? CallToAction { get; set; }
    }
    public sealed class ResumeSummaryRequest
    {
        public string? TargetRole { get; set; }
        public string? Skills { get; set; }
        public object[]? Experience { get; set; }
        public object[]? Education { get; set; }
        public string? ExistingSummary { get; set; }
    }
    public sealed class AtsReviewRequest { public string ResumeText { get; set; } = ""; public string JobDescription { get; set; } = ""; }
    private sealed record AiResult(bool Success, string? Text, int StatusCode, string? Error)
    {
        public static AiResult Ok(string text) => new(true, text, 200, null);
        public static AiResult Fail(int status, string error) => new(false, null, status, error);
    }
}
