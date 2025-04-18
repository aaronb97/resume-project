namespace ResumeAPI.Models
{
    public class GenerateRecommendationsRequest
    {
        public required Guid Id { get; set; }
        public required string JobDescription { get; set; }
        public required string UserNotes { get; set; }
        public bool MockData { get; set; }
    }
}
