using System.Net.Http.Json;
using System.Text;
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
        if (string.IsNullOrWhiteSpace(request.Topic) || request.Topic.Length > 4000)
            return BadRequest(new { message = "Topic is required and must be 4000 characters or fewer." });
        if (!AllowedPlatforms.Contains(request.Platform)) return BadRequest(new { message = "Unsupported platform." });
        if (!AllowedTones.Contains(request.Tone)) return BadRequest(new { message = "Unsupported tone." });

        var prompt = $"Create one original social media caption for {request.Platform}. Tone: {request.Tone}. Topic: {request.Topic}. Include a few relevant hashtags where suitable. Do not claim facts not supplied by the user. Return only the caption.";
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
        if (experience.Length > 8000 || education.Length > 4000)
            return BadRequest(new { message = "Experience or education is too long. Please shorten it." });
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

    [HttpPost("career")]
    public async Task<IActionResult> Career([FromBody] CareerRequest request, CancellationToken cancellationToken)
    {
        if (!CareerKinds.Contains(request.Kind)) return BadRequest(new { message = "Unsupported career tool." });
        if (string.IsNullOrWhiteSpace(request.Role)) return BadRequest(new { message = "Target role is required." });
        if (request.Role.Length > 160 || (request.Company?.Length ?? 0) > 160 || (request.Background?.Length ?? 0) > 5000 || (request.JobDescription?.Length ?? 0) > 8000)
            return BadRequest(new { message = "One or more fields exceed the allowed length." });

        var tone = AllowedTones.Contains(request.Tone) ? request.Tone : "Professional";
        var task = request.Kind.ToLowerInvariant() switch
        {
            "cover-letter" => "Write a tailored cover letter (250-350 words) with a strong opening, 2 short evidence paragraphs and a confident close.",
            "interview" => "List 8 likely interview questions for this role (mix of behavioural, technical and role-specific). For each give a short model answer outline the candidate can adapt.",
            "linkedin" => "Write a LinkedIn headline (max 220 characters) and an About section (120-180 words) in first person.",
            _ => "Write a short, polite post-interview follow-up email (under 150 words) with a subject line."
        };
        var prompt = $"{task} Tone: {tone}. Target role: {request.Role}. Company: {(string.IsNullOrWhiteSpace(request.Company) ? "not specified" : request.Company)}. " +
                     $"Candidate background (use only what is stated, never invent facts, dates or numbers): {request.Background}. " +
                     $"Job description for context: {request.JobDescription}. Return only the final text, no preamble.";
        var result = await GenerateText(prompt, cancellationToken);
        return result.Success ? Ok(new { text = result.Text }) : StatusCode(result.StatusCode, new { message = result.Error });
    }

    private async Task<AiResult> GenerateText(string prompt, CancellationToken cancellationToken)
    {
        var apiKey = _config["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return AiResult.Fail(StatusCodes.Status503ServiceUnavailable, "AI provider is not configured. Set Gemini__ApiKey on the backend host.");

        try
        {
            // gemini-2.5-flash was shut down on the Gemini Developer API on 16 Oct 2026.
            // The model is configurable (Gemini__Model) so future retirements do not need a code change.
            var model = _config["Gemini:Model"];
            if (string.IsNullOrWhiteSpace(model)) model = "gemini-3.6-flash";
            // Send the key in a header (not the URL) so it never ends up in request logs.
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(model)}:generateContent";
            var body = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };
            using var message = new HttpRequestMessage(HttpMethod.Post, url) { Content = JsonContent.Create(body) };
            message.Headers.Add("x-goog-api-key", apiKey);
            using var response = await _httpClientFactory.CreateClient().SendAsync(message, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("Gemini provider returned status {StatusCode} for model {Model}: {Body}",
                    (int)response.StatusCode, model, errorBody.Length > 500 ? errorBody[..500] : errorBody);
                return AiResult.Fail(StatusCodes.Status502BadGateway, "AI provider request failed. Check the backend API key, model name and provider quota.");
            }
            using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            var parts = doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts");
            var builder = new StringBuilder();
            foreach (var part in parts.EnumerateArray())
            {
                if (part.TryGetProperty("thought", out var thought) && thought.ValueKind == JsonValueKind.True) continue;
                if (part.TryGetProperty("text", out var partText) && partText.ValueKind == JsonValueKind.String)
                    builder.Append(partText.GetString());
            }
            var text = builder.ToString();
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
    private static readonly HashSet<string> CareerKinds = new(StringComparer.OrdinalIgnoreCase)
        { "cover-letter", "interview", "linkedin", "follow-up" };
    private static readonly HashSet<string> AllowedTones = new(StringComparer.OrdinalIgnoreCase)
        { "Professional", "Friendly", "Innovative", "Casual", "Funny", "Inspirational", "Educational", "Luxury", "Bold", "Playful" };

    public sealed class CaptionRequest { public string Topic { get; set; } = ""; public string Tone { get; set; } = "Professional"; public string Platform { get; set; } = "LinkedIn"; }
    public sealed class ResumeSummaryRequest
    {
        public string? TargetRole { get; set; }
        public string? Skills { get; set; }
        public object[]? Experience { get; set; }
        public object[]? Education { get; set; }
        public string? ExistingSummary { get; set; }
    }
    public sealed class CareerRequest
    {
        public string Kind { get; set; } = "";
        public string Role { get; set; } = "";
        public string? Company { get; set; }
        public string? Background { get; set; }
        public string? JobDescription { get; set; }
        public string Tone { get; set; } = "Professional";
    }
    public sealed class AtsReviewRequest { public string ResumeText { get; set; } = ""; public string JobDescription { get; set; } = ""; }
    private sealed record AiResult(bool Success, string? Text, int StatusCode, string? Error)
    {
        public static AiResult Ok(string text) => new(true, text, 200, null);
        public static AiResult Fail(int status, string error) => new(false, null, status, error);
    }
}
