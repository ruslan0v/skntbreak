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
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);
        }
        public async Task<IEnumerable<Break>> GetAllAsync()
        {
            return await _context.Breaks
                .AsNoTracking()
                .OrderBy(b => b.Id)
                .ToListAsync();
        }
        public async Task<IEnumerable<Break>> GetActiveBreaksByUserAsync(int userId)
        {
            return await _context.Breaks
                .Include(b => b.User)
                .AsNoTracking()
                .Where(b => b.UserId == userId && b.Status == BreakStatus.OnBreak)
                .OrderByDescending(b => b.StartTime)
                .ToListAsync();
        }
        public async Task<IEnumerable<Break>> GetActiveBreaksByScheduleAsync(int scheduleId)
        {
            return await _context.Breaks
                .Include(b => b.User)
                .AsNoTracking()
                .Where(b => b.User.ScheduleId == scheduleId && b.Status == BreakStatus.OnBreak)
                .OrderByDescending(b => b.StartTime)
                .ToListAsync();
        }
        public async Task<Break> AddAsync(Break brk)
        {
            if (brk.UserId <= 0)
                throw new ArgumentException("Поле с UserId не может быть пустым");

            if (await _context.Breaks.AnyAsync(b => b.UserId == brk.UserId && b.Status == BreakStatus.OnBreak))
                throw new InvalidOperationException($"У пользователя с Id '{brk.UserId}' уже есть активный перерыв");

            await _context.Breaks.AddAsync(brk);
            await _context.SaveChangesAsync();

            return brk;
        }

        public async Task UpdateAsync(Break brk)
        {
            var breakEntity = await _context.Breaks.FindAsync(brk.Id);
            if (breakEntity == null)
            {
                throw new InvalidOperationException($"Перерыв с Id - {brk.Id} не найден");
            }

            if (brk.Status == BreakStatus.OnBreak && breakEntity.Status != BreakStatus.OnBreak)
            {
                if (await _context.Breaks.AnyAsync(b => b.UserId == brk.UserId && b.Status == BreakStatus.OnBreak && b.Id != brk.Id))
                {
                    throw new InvalidOperationException($"У пользователя с Id '{brk.UserId}' уже есть активный перерыв");
                }
            }

            _context.Breaks.Update(brk);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var brk = await _context.Breaks
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (brk == null)
            {
                throw new InvalidOperationException($"Перерыв с данным Id - {id} не найден");
            }

            if (brk.Status == BreakStatus.OnBreak)
            {
                throw new InvalidOperationException($"Нельзя удалить активный перерыв");
            }

            _context.Breaks.Remove(brk);
            await _context.SaveChangesAsync();
        }
    }
}
