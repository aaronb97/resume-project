namespace ResumeAPI.Contracts;

public class RecommendationToProcess
{
    public required string Text { get; set; }
    public required int LineNum { get; set; }
}
