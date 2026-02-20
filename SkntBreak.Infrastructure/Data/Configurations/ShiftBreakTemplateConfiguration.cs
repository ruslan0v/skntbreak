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
    public class ShiftBreakTemplateConfiguration : IEntityTypeConfiguration<ShiftBreakTemplate>
    {
        public void Configure(EntityTypeBuilder<ShiftBreakTemplate> builder)
        {
            builder.HasKey(sbt => sbt.Id);

            builder.Property(sbt => sbt.Order)
                .IsRequired();

            builder.Property(sbt => sbt.DurationMinutes)
                .IsRequired();

            builder.HasOne(sbt => sbt.Schedule)
                .WithMany(s => s.BreakTemplates)
                .HasForeignKey(sbt => sbt.ScheduleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
