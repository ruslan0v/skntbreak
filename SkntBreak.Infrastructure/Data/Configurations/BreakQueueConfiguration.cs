using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace SkntBreak.Infrastructure.Data.Configurations
{
    public class BreakQueueConfiguration : IEntityTypeConfiguration<BreakQueue>
    {
        public void Configure(EntityTypeBuilder<BreakQueue> builder)
        {
            builder.HasKey(q => q.Id);

            builder.Property(q => q.WorkDate).IsRequired();
            builder.Property(q => q.Group).IsRequired();
            builder.Property(q => q.BreakRound).IsRequired();
            builder.Property(q => q.Position).IsRequired();
            builder.Property(q => q.DurationMinutes).IsRequired();
            builder.Property(q => q.Status).IsRequired();
            builder.Property(q => q.EnqueuedAt).IsRequired();
            builder.Property(q => q.IsPriority).IsRequired().HasDefaultValue(false);

            builder.HasOne(q => q.UserShift)
                .WithMany(us => us.QueueEntries)
                .HasForeignKey(q => q.UserShiftId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(q => new { q.WorkDate, q.Group, q.BreakRound, q.Position })
                .HasDatabaseName("IX_BreakQueues_WorkDate_Group_Round_Pos");

            builder.HasIndex(q => new { q.Status, q.NotifiedAt })
                .HasDatabaseName("IX_BreakQueues_Status_NotifiedAt");
        }
    }
}