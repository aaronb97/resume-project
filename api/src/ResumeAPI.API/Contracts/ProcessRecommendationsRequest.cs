namespace ResumeAPI.Contracts;

public class ProcessRecommendationsRequest
{
    public required Guid Id { get; set; }
    public required RecommendationToProcess[] Recommendations { get; set; }
}
