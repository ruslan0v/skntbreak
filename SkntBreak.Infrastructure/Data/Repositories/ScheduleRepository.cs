using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace SkntBreak.Infrastructure.Data.Repositories
{
    public class ScheduleRepository : IScheduleRepository
    {
        private readonly SkntbreakDbContext _context;

        public ScheduleRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<Schedule?> GetByIdAsync(int id)
        {
            return await _context.Schedules
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<IEnumerable<Schedule>> GetAllAsync()
        {
            return await _context.Schedules
                .AsNoTracking()
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task<Schedule?> GetWithRulesAsync(int id)
        {
            return await _context.Schedules
                .Include(s => s.BreakTemplates)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Schedule?> GetWithUsersAsync(int id)
        {
            return await _context.Schedules
                .Include(s => s.UserShifts)
                    .ThenInclude(us => us.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Schedule> AddAsync(Schedule schedule)
        {
            if (string.IsNullOrWhiteSpace(schedule.Name))
                throw new ArgumentException("Поле с именем не может быть пустым");

            await _context.Schedules.AddAsync(schedule);
            await _context.SaveChangesAsync();

            return schedule;
        }

        public async Task UpdateAsync(Schedule schedule)
        {
            var scheduleEntity = await _context.Schedules.FindAsync(schedule.Id);
            if (scheduleEntity == null)
            {
                throw new InvalidOperationException($"Расписание с Id - {schedule.Id} не найдено");
            }

            _context.Schedules.Update(schedule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var schedule = await _context.Schedules
                .FirstOrDefaultAsync(u => u.Id == id);

            if (schedule == null)
            {
                throw new InvalidOperationException($"Расписание с данным Id - {id} не найден");
            }

            _context.Schedules.Remove(schedule);
            await _context.SaveChangesAsync();
        }
    }
}
