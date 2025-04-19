namespace ResumeAPI.Models
{
    public class GenerateRecommendationsRequest
    {
        public required Guid Id { get; set; }
        public bool MockData { get; set; }
    }
}
