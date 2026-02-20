using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace SkntBreak.Infrastructure.Data.Repositories
{
    public class BreakRepository : IBreakRepository
    {
        private readonly SkntbreakDbContext _context;

        public BreakRepository(SkntbreakDbContext context)
        {
            _context = context;
        }
        public async Task<Break?> GetByIdAsync(int id)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);
        }
        public async Task<IEnumerable<Break>> GetAllAsync()
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .AsNoTracking()
                .OrderBy(b => b.Id)
                .ToListAsync();
        }
        public async Task<IEnumerable<Break>> GetActiveBreaksByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .AsNoTracking()
                .Where(b => b.UserShift.UserId == userId && b.Status == BreakStatus.Taken)
                .OrderByDescending(b => b.StartTime)
                .ToListAsync();
        }
        public async Task<Break> GetActiveBreakByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                .ThenInclude(us => us.User)
                .AsNoTracking()
                .Where(b => b.UserShift.UserId == userId && b.Status == BreakStatus.Taken)
                .FirstOrDefaultAsync();
        }
        public async Task<IEnumerable<Break>> GetActiveBreaksByScheduleAsync(int scheduleId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .AsNoTracking()
                .Where(b => b.UserShift.ScheduleId == scheduleId && b.Status == BreakStatus.Taken)
                .OrderByDescending(b => b.StartTime)
                .ToListAsync();
        }
        public async Task<Break?> GetAvailableBreakAsync(int userShiftId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .Where(b => b.UserShiftId == userShiftId && b.Status == BreakStatus.Available)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
        public async Task<Break?> GetNextAvailableBreakByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                .Where(b => b.UserShift.UserId == userId &&
                           b.Status == BreakStatus.Available)
                .OrderBy(b => b.BreakNumber)
                .FirstOrDefaultAsync();
        }


        public async Task<Break?> GetLastFinishedBreakByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Where(b => b.UserShift.UserId == userId && b.Status == BreakStatus.Finished && b.EndTime.HasValue)
                .OrderByDescending(b => b.EndTime)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<Break?> GetLastBreakByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                .Where(b => b.UserShift.UserId == userId)
                .OrderByDescending(b => b.BreakNumber)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Break>> GetBreaksByDateAndGroupAsync(DateOnly workDate, ShiftType group)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.Schedule)
                .AsNoTracking()
                .Where(b => b.WorkDate == workDate && b.UserShift.Group == group)
                .OrderBy(b => b.BreakNumber)
                    .ThenBy(b => b.UserShift.User.UserName)
                .ToListAsync();
        }

        public async Task<Break> AddAsync(Break brk)
        {
            if (brk.UserShiftId <= 0)
                throw new ArgumentException("Поле с UserShiftId не может быть пустым");

            var userShift = await _context.UserShifts
                .Include(us => us.Breaks)
                .FirstOrDefaultAsync(us => us.Id == brk.UserShiftId);

            if (userShift == null)
                throw new ArgumentException($"UserShift с Id '{brk.UserShiftId}' не найден");

            if (userShift.Breaks.Any(b => b.Status == BreakStatus.Taken))
                throw new InvalidOperationException($"У пользователя уже есть активный перерыв");

            await _context.Breaks.AddAsync(brk);
            await _context.SaveChangesAsync();

            return brk;
        }

        public async Task<Break?> GetLastBreakByUserShiftAsync(int userShiftId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                .Where(b => b.UserShiftId == userShiftId)
                .OrderByDescending(b => b.BreakNumber)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<Break?> GetActiveBreakByUserShiftAsync(int userShiftId)
        {
            return await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .AsNoTracking()
                .Where(b => b.UserShiftId == userShiftId && b.Status == BreakStatus.Taken)
                .FirstOrDefaultAsync();
        }

        public async Task UpdateAsync(Break brk)
        {
            var breakEntity = await _context.Breaks
                .Include(b => b.UserShift)
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == brk.Id);

            if (breakEntity == null)
                throw new InvalidOperationException($"Перерыв с Id {brk.Id} не найден");

            // Проверяем только если мы СОЗДАЁМ новый активный перерыв
            // НЕ проверяем если завершаем существующий
            if (brk.Status == BreakStatus.Taken && breakEntity.Status != BreakStatus.Taken)
            {
                // Только при переходе в Taken проверяем, нет ли уже активного перерыва
                var hasActiveBreak = await _context.Breaks
                    .Include(b => b.UserShift)
                    .AnyAsync(b =>
                        b.UserShift.UserId == breakEntity.UserShift.UserId &&
                        b.Status == BreakStatus.Taken &&
                        b.Id != brk.Id);

                if (hasActiveBreak)
                    throw new InvalidOperationException("У пользователя уже есть активный перерыв");
            }

            _context.Breaks.Update(brk);
            await _context.SaveChangesAsync();
        }


        public async Task DeleteAsync(int id)
        {
            var brk = await _context.Breaks
                .Include(b => b.UserShift)
                    .ThenInclude(us => us.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brk == null)
            {
                throw new InvalidOperationException($"Перерыв с данным Id - {id} не найден");
            }

            if (brk.Status == BreakStatus.Taken)
            {
                throw new InvalidOperationException($"Нельзя удалить активный перерыв");
            }

            _context.Breaks.Remove(brk);
            await _context.SaveChangesAsync();
        }
    }
}
