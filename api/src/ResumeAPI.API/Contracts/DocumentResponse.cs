using ResumeAPI.Utils;

namespace ResumeAPI.Contracts;

public class DocumentResponse
{
    public required Guid Id { get; set; }
    public required string FileName { get; set; }
    public required string S3Key { get; set; }
    public required string SignedUrl { get; set; }
    public required string JobDescription { get; set; }
    public required string UserNotes { get; set; }
    public required ResumePart[] ResumeParts { get; set; } = Array.Empty<ResumePart>();
}
