// UserRecord.cs
namespace ResumeAPI.Data;

public class UserRecord
{
    public string Id { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public int RemainingGenerations { get; set; } = 10;
    public DateTimeOffset? LastGeneration { get; set; } = null;
}
