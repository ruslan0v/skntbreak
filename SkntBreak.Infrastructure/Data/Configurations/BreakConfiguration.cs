using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace SkntBreak.Infrastructure.Data.Configurations
{
    public class BreakConfiguration : IEntityTypeConfiguration<Break>
    {
        public void Configure(EntityTypeBuilder<Break> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Status)
                .IsRequired();

            builder.Property(b => b.StartTime)
                .IsRequired();

            builder.Property(b => b.EndTime)
                .IsRequired(false);

            builder.Property(b => b.DurationMinutes)
                .IsRequired();

            builder.Property(b => b.BreakNumber)
                .IsRequired();

            builder.Property(b => b.WorkDate)
                .IsRequired();

            builder.HasOne(b => b.UserShift)
                .WithMany(us => us.Breaks)
                .HasForeignKey(b => b.UserShiftId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
