namespace ResumeAPI.Models;

public class DocumentResponse
{
    public required Guid Id { get; set; }
    public required string FileName { get; set; }
    public required string S3Key { get; set; }
    public required string SignedUrl { get; set; }
}
