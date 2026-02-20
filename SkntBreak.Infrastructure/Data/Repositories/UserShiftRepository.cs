using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data;

namespace SkntBreak.Infrastructure.Data.Repositories
{
    public class UserShiftRepository : IUserShiftRepository
    {
        private readonly SkntbreakDbContext _context;

        public UserShiftRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<UserShift> AddAsync(UserShift userShift)
        {
            await _context.UserShifts.AddAsync(userShift);
            await _context.SaveChangesAsync();

            // После создания загружаем связанные данные
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .FirstOrDefaultAsync(us => us.Id == userShift.Id);
        }

        public async Task<UserShift?> GetByIdAsync(int id)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .FirstOrDefaultAsync(us => us.Id == id);
        }

        public async Task<UserShift?> GetByUserAndDateAsync(int userId, DateOnly workDate)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .FirstOrDefaultAsync(us => us.UserId == userId && us.WorkDate == workDate);
        }

        public async Task<IEnumerable<UserShift>> GetByScheduleAndDateAsync(int scheduleId, DateOnly date)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Where(us => us.ScheduleId == scheduleId && us.WorkDate == date)
                .OrderBy(us => us.User.UserName)
                .ToListAsync();
        }


        public async Task<IEnumerable<UserShift>> GetByUserAsync(int userId)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Where(us => us.UserId == userId)
                .OrderByDescending(us => us.WorkDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserShift>> GetByScheduleAsync(int scheduleId)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Where(us => us.ScheduleId == scheduleId)
                .OrderByDescending(us => us.WorkDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserShift>> GetByDateAsync(DateOnly date)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Where(us => us.WorkDate == date)
                .ToListAsync();
        }

        public async Task<UserShift?> GetActiveShiftAsync(int userId)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Include(us => us.QueueEntries)
                .Where(us => us.UserId == userId && us.EndedAt == null)
                .OrderByDescending(us => us.StartedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<UserShift>> GetByDateAndGroupAsync(DateOnly date, ShiftType group)
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .Where(us => us.WorkDate == date && us.Group == group)
                .ToListAsync();
        }

        public async Task<IEnumerable<UserShift>> GetAllAsync()
        {
            return await _context.UserShifts
                .Include(us => us.User)
                .Include(us => us.Schedule)
                .Include(us => us.Breaks)
                .OrderByDescending(us => us.WorkDate)
                .ToListAsync();
        }

        public async Task UpdateAsync(UserShift userShift)
        {
            _context.UserShifts.Update(userShift);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var userShift = await _context.UserShifts.FindAsync(id);
            if (userShift != null)
            {
                _context.UserShifts.Remove(userShift);
                await _context.SaveChangesAsync();
            }
        }
    }
}
