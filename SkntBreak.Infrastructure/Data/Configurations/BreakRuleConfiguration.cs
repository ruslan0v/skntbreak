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
    public class BreakRuleConfiguration : IEntityTypeConfiguration<BreakRule>
    {
        public void Configure(EntityTypeBuilder<BreakRule> builder)
        {
            builder.HasKey(br => br.Id);

            builder.Property(br => br.Type)
                .IsRequired();

            builder.Property(br => br.MaxCount)
                .IsRequired();

            builder.HasOne(br => br.Schedule)
                    .WithMany(s => s.BreakRules)
                    .HasForeignKey(br => br.ScheduleId);
        }
    }
}
