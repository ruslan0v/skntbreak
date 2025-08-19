using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Entities;
using SkntBreak.Infrastructure.Data;

namespace Skntbreak.Infrastructure.Data.Repositories
{
    public class BreakChatRepository : IBreakChatRepository
    {
        private readonly SkntbreakDbContext _context;

        public BreakChatRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<BreakChat?> GetByIdAsync(int id)
        {
            return await _context.BreakChats
                .Include(bc => bc.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(bc => bc.Id == id);
        }

        public async Task<IEnumerable<BreakChat>> GetAllAsync()
        {
            return await _context.BreakChats
                .Include(bc => bc.User)
                .AsNoTracking()
                .OrderByDescending(bc => bc.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<BreakChat>> GetByUserAsync(int userId)
        {
            return await _context.BreakChats
                .Include(bc => bc.User)
                .AsNoTracking()
                .Where(bc => bc.UserId == userId)
                .OrderByDescending(bc => bc.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<BreakChat>> GetByScheduleAsync(int scheduleId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            return await _context.BreakChats
                .Include(bc => bc.User)
                .AsNoTracking()
                .Where(bc => bc.User.ScheduleId == scheduleId &&
                             bc.StartTime >= startOfDay &&
                             bc.StartTime < endOfDay)
                .OrderByDescending(bc => bc.StartTime)
                .ToListAsync();
        }

        public async Task<BreakChat> AddAsync(BreakChat chatBreak)
        {
            if (chatBreak.UserId <= 0)
                throw new ArgumentException("Поле с UserId не может быть пустым");

            if (chatBreak.StartTime >= chatBreak.EndTime)
                throw new ArgumentException("Время начала должно быть меньше времени окончания");

            var overlappingBreaks = await _context.BreakChats
                .AnyAsync(bc => bc.UserId == chatBreak.UserId &&
                               ((bc.StartTime <= chatBreak.StartTime && bc.EndTime > chatBreak.StartTime) ||
                                (bc.StartTime < chatBreak.EndTime && bc.EndTime >= chatBreak.EndTime) ||
                                (bc.StartTime >= chatBreak.StartTime && bc.EndTime <= chatBreak.EndTime)));

            if (overlappingBreaks)
                throw new InvalidOperationException("Перерыв пересекается с существующими перерывами пользователя");

            await _context.BreakChats.AddAsync(chatBreak);
            await _context.SaveChangesAsync();

            return chatBreak;
        }

        public async Task UpdateAsync(BreakChat chatBreak)
        {
            var chatBreakEntity = await _context.BreakChats.FindAsync(chatBreak.Id);
            if (chatBreakEntity == null)
            {
                throw new InvalidOperationException($"Запись перерыва с Id - {chatBreak.Id} не найдена");
            }

            if (chatBreak.StartTime >= chatBreak.EndTime)
                throw new ArgumentException("Время начала должно быть меньше времени окончания");

            var overlappingBreaks = await _context.BreakChats
                .AnyAsync(bc => bc.UserId == chatBreak.UserId &&
                               bc.Id != chatBreak.Id &&
                               ((bc.StartTime <= chatBreak.StartTime && bc.EndTime > chatBreak.StartTime) ||
                                (bc.StartTime < chatBreak.EndTime && bc.EndTime >= chatBreak.EndTime) ||
                                (bc.StartTime >= chatBreak.StartTime && bc.EndTime <= chatBreak.EndTime)));

            if (overlappingBreaks)
                throw new InvalidOperationException("Перерыв пересекается с существующими перерывами пользователя");

            _context.BreakChats.Update(chatBreak);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var chatBreak = await _context.BreakChats
                .Include(bc => bc.User)
                .FirstOrDefaultAsync(bc => bc.Id == id);

            if (chatBreak == null)
            {
                throw new InvalidOperationException($"Запись перерыва с данным Id - {id} не найдена");
            }

            _context.BreakChats.Remove(chatBreak);
            await _context.SaveChangesAsync();
        }
    }
}
