namespace ResumeAPI.Models;

public class AiRecommendation
{
    public required int LineNum { get; set; }
    public required string Text { get; set; }
    public required string Rationale { get; set; }
}
