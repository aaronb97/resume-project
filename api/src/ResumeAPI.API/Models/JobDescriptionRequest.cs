namespace ResumeAPI.Models
{
    public class JobDescriptionRequest
    {
        public required Guid Id { get; set; }
        public required string JobDescription { get; set; }
    }
}
