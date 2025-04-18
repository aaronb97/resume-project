using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ResumeAPI.Models;

namespace ResumeAPI.EntityConfigurations;

public sealed class DocumentRecordConfiguration : IEntityTypeConfiguration<DocumentRecord>
{
    public void Configure(EntityTypeBuilder<DocumentRecord> builder)
    {
        builder.Property(dr => dr.FileName).HasMaxLength(255); // Windows & most file systems safely allow up to 255 chars
        builder.Property(dr => dr.S3Key).HasMaxLength(1024); // AWS S3 object‑key limit is 1 024 bytes
        builder.Property(dr => dr.SignedUrl).HasMaxLength(2083); // Practical browser URL length limit
        builder.Property(dr => dr.JobDescription).HasMaxLength(16000);
        builder.Property(dr => dr.UserNotes).HasMaxLength(4000);
    }
}
