using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace SkntBreak.Infrastructure.Data.Configurations
{
    public class UserShiftConfiguration : IEntityTypeConfiguration<UserShift>
    {
        public void Configure(EntityTypeBuilder<UserShift> builder)
        {
            builder.HasKey(us => us.Id);

            builder.Property(us => us.WorkDate)
                .IsRequired();

            builder.Property(us => us.Group)
                .IsRequired();

            builder.HasOne(us => us.User)
                .WithMany(u => u.UserShifts)
                .HasForeignKey(us => us.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(us => us.Schedule)
                .WithMany(s => s.UserShifts)
                .HasForeignKey(us => us.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(us => us.Breaks)
                .WithOne(b => b.UserShift)
                .HasForeignKey(b => b.UserShiftId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(us => new { us.UserId, us.WorkDate })
                .IsUnique();
        }
    }
}
