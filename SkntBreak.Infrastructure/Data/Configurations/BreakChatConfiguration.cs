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
    public class BreakChatConfiguration : IEntityTypeConfiguration<BreakChat>
    {
        public void Configure(EntityTypeBuilder<BreakChat> builder)
        {
            builder.HasKey(bc => bc.Id);

            builder.Property(bc => bc.BreakNumber)
                .IsRequired();

            builder.Property(bc => bc.IsReserved)
                .IsRequired();

            builder.HasOne(bc => bc.User)
                .WithMany(u => u.BreakChats)
                .HasForeignKey(bc => bc.UserId);
        }
    }
}
