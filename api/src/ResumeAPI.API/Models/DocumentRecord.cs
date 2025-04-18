namespace ResumeAPI.Models;

public class DocumentRecord
{
    public Guid Id { get; set; }
    public required string FileName { get; set; }
    public required string S3Key { get; set; }
    public required string SignedUrl { get; set; } = String.Empty;
    public required string JobDescription { get; set; } = String.Empty;
    public string UserNotes { get; set; } = String.Empty;
    public DateTime UploadedAt { get; set; }
}
