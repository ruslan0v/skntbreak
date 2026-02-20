// SkntBreak.Infrastructure/Data/SkntbreakDbContext.cs

using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Infrastructure.Data.Configurations;
using SkntBreak.Infrastructure.Data.Configurations;

namespace SkntBreak.Infrastructure.Data
{
    public class SkntbreakDbContext : DbContext
    {
        public SkntbreakDbContext(DbContextOptions<SkntbreakDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Schedule> Schedules { get; set; }
        public DbSet<ShiftBreakTemplate> ShiftBreakTemplates { get; set; }
        public DbSet<UserShift> UserShifts { get; set; }
        public DbSet<Break> Breaks { get; set; }
        public DbSet<BreakChat> BreakChats { get; set; }
        public DbSet<BreakPoolDay> BreakPoolDays { get; set; }
        public DbSet<BreakQueue> BreakQueues { get; set; }  // <<< ДОБАВЬ ЭТУ СТРОКУ

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new ScheduleConfiguration());
            modelBuilder.ApplyConfiguration(new ShiftBreakTemplateConfiguration());
            modelBuilder.ApplyConfiguration(new UserShiftConfiguration());
            modelBuilder.ApplyConfiguration(new BreakConfiguration());
            modelBuilder.ApplyConfiguration(new BreakChatConfiguration());
            modelBuilder.ApplyConfiguration(new BreakPoolDayConfiguration());
            modelBuilder.ApplyConfiguration(new BreakQueueConfiguration());  // <<< ДОБАВЬ ЭТУ СТРОКУ
        }
    }
}
