namespace ResumeAPI.Models;

public class ResumeAiResponse
{
    public required Recommendation[] Recommendations { get; set; }
}

public class Recommendation
{
    public required int LineNum { get; set; }
    public required string Text { get; set; }
    public required string Rationale { get; set; }
}
