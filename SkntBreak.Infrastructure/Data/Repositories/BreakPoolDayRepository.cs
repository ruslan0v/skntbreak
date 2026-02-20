using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data;

namespace Skntbreak.Infrastructure.Data.Repositories
{
    public class BreakPoolDayRepository : IBreakPoolDayRepository
    {
        private readonly SkntbreakDbContext _context;

        public BreakPoolDayRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BreakPoolDay>> GetAllAsync()
        {
            return await _context.BreakPoolDays
                .AsNoTracking()
                .OrderBy(b => b.Id)
                .ToListAsync();
        }

        public async Task<BreakPoolDay?> GetByIdAsync(int id)
        {
            return await _context.BreakPoolDays
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<BreakPoolDay?> GetByDateAndShiftAsync(DateOnly workDate, ShiftType shiftType)
        {
            return await _context.BreakPoolDays
                .FirstOrDefaultAsync(b => b.WorkDate == workDate && b.Group == shiftType);
        }

        public async Task<BreakPoolDay> AddAsync(BreakPoolDay breakPoolDay)
        {
            _context.BreakPoolDays.Add(breakPoolDay);
            await _context.SaveChangesAsync();
            return breakPoolDay;
        }

        public async Task<BreakPoolDay> UpdateAsync(BreakPoolDay breakPoolDay)
        {
            _context.BreakPoolDays.Update(breakPoolDay);
            await _context.SaveChangesAsync();
            return breakPoolDay;
        }

        public async Task DeleteAsync(int id)
        {
            var breakPoolDay = await _context.BreakPoolDays.FindAsync(id);
            if (breakPoolDay != null)
            {
                _context.BreakPoolDays.Remove(breakPoolDay);
                await _context.SaveChangesAsync();
            }
        }
    }
}
