using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SkntBreak.Infrastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);

            builder.Property(u => u.UserName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(u => u.Login)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            builder.HasOne(u => u.Schedule)
               .WithMany(s => s.Users)
               .HasForeignKey(u => u.ScheduleId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(u => u.Breaks)
                .WithOne(b => b.User)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(u => u.BreakChats)
                .WithOne(bs => bs.User)
                .HasForeignKey(bs => bs.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

