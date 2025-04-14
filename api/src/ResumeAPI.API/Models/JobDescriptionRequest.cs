namespace ResumeAPI.Models
{
    public class JobDescriptionRequest
    {
        public Guid Id { get; set; }
        public required string JobDescription { get; set; }
    }
}
