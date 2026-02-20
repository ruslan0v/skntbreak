using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;

namespace Skntbreak.Core.Interfaces
{
    public interface IShiftBreakTemplateRepository
    {
        Task<ShiftBreakTemplate?> GetByIdAsync(int id);
        Task<IEnumerable<ShiftBreakTemplate>> GetAllAsync();
        Task<IEnumerable<ShiftBreakTemplate>> GetByScheduleAsync(int scheduleId);

        Task<ShiftBreakTemplate> AddAsync(ShiftBreakTemplate template);
        Task UpdateAsync(ShiftBreakTemplate template);
        Task DeleteAsync(int id);
    }
}
