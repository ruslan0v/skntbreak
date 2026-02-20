using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace SkntBreak.Infrastructure.Data.Configurations
{
    public class ScheduleConfiguration : IEntityTypeConfiguration<Schedule>
    {
        public void Configure(EntityTypeBuilder<Schedule> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(s => s.StartTime)
                .IsRequired();

            builder.Property(s => s.EndTime)
                .IsRequired();

            builder.HasMany(s => s.UserShifts)
                .WithOne(us => us.Schedule)
                .HasForeignKey(us => us.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(s => s.BreakTemplates)
                .WithOne(bt => bt.Schedule)
                .HasForeignKey(bt => bt.ScheduleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
