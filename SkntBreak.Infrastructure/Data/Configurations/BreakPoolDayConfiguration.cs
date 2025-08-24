using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Skntbreak.Core.Entities;

namespace Skntbreak.Infrastructure.Data.Configurations
{
    public class BreakPoolDayConfiguration : IEntityTypeConfiguration<BreakPoolDay>
    {
        public void Configure(EntityTypeBuilder<BreakPoolDay> builder)
        {
            builder.HasKey(bpd => bpd.Id);
            builder.Property(bpd => bpd.WorkDate).IsRequired();
            builder.Property(bpd => bpd.Group).IsRequired();
        }
    }
}
