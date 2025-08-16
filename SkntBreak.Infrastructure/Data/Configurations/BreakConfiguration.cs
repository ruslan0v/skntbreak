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

            builder.Property(b => b.Type)
                .IsRequired();

            builder.Property(b => b.StartTime)
                .IsRequired();

            builder.HasOne(b => b.User)
                .WithMany(u => u.Breaks)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
