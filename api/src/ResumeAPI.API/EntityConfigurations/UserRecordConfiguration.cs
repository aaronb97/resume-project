using ResumeAPI.Data;

namespace ResumeAPI.EntityConfigurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class UserRecordConfiguration : IEntityTypeConfiguration<UserRecord>
{
    public void Configure(EntityTypeBuilder<UserRecord> builder)
    {
        builder.HasKey(u => u.Id);
        builder.HasIndex(u => u.Id);
        builder.Property(u => u.Id).HasMaxLength(128);
    }
}
