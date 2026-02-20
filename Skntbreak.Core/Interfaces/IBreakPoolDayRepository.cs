using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakPoolDayRepository
    {
        Task<IEnumerable<BreakPoolDay>> GetAllAsync();
        Task<BreakPoolDay?> GetByIdAsync(int id);
        Task<BreakPoolDay?> GetByDateAndShiftAsync(DateOnly workDate, ShiftType shiftType);
        Task<BreakPoolDay> AddAsync(BreakPoolDay breakPoolDay);
        Task<BreakPoolDay> UpdateAsync(BreakPoolDay breakPoolDay);
        Task DeleteAsync(int id);
    }
}
