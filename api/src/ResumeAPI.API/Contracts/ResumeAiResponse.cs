namespace ResumeAPI.Contracts;

public class ResumeAiResponse
{
    public required AiRecommendation[] Recommendations { get; set; }
}
