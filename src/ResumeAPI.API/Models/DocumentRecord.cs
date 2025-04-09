namespace ResumeAPI.Models;

public class DocumentRecord
{
    public Guid Id { get; set; }
    public required string FileName { get; set; }
    public required string S3Key { get; set; }
    public DateTime UploadedAt { get; set; } 
}