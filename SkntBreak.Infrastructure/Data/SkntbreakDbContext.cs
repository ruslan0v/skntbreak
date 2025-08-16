using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using SkntBreak.Infrastructure.Data.Configurations;

namespace SkntBreak.Infrastructure.Data
{
    public class SkntbreakDbContext : DbContext
    {
        public SkntbreakDbContext(DbContextOptions<SkntbreakDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<BreakRule> BreakRules { get; set; }
        public DbSet<Break> Breaks { get; set; }
        public DbSet<BreakChat> BreakChats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ScheduleConfiguration());
            modelBuilder.ApplyConfiguration(new BreakRuleConfiguration());
            modelBuilder.ApplyConfiguration(new BreakConfiguration());
            modelBuilder.ApplyConfiguration(new BreakChatConfiguration());
        }
    }
}
