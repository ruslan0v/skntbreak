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
    public class BreakRuleConfiguration : IEntityTypeConfiguration<ShiftBreakTemplate>
    {
        public void Configure(EntityTypeBuilder<ShiftBreakTemplate> builder)
        {
            builder.HasKey(br => br.Id);

            builder.Property(br => br.Type)
                .IsRequired();

            builder.Property(br => br.AllowedDurations)
                .IsRequired()
                .HasDefaultValue("[]");

            builder.Property(br => br.MinIntervalMinutes)
                .IsRequired();

            builder.HasOne(br => br.Schedule)
                    .WithMany(s => s.BreakRules)
                    .HasForeignKey(br => br.ScheduleId)
                    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
