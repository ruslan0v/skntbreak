using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    namespace Skntbreak.Application.Interfaces
    {
        public interface IBreakRuleRepository
        {
            Task<ShiftBreakTemplate?> GetByIdAsync(int id);
            Task<IEnumerable<ShiftBreakTemplate>> GetAllAsync();
            Task<IEnumerable<ShiftBreakTemplate>> GetByScheduleAsync(int scheduleId);
            Task<ShiftBreakTemplate?> GetByTypeAndScheduleAsync(BreakType type, int scheduleId);

            Task<ShiftBreakTemplate> AddAsync(ShiftBreakTemplate rule);
            Task UpdateAsync(ShiftBreakTemplate rule);
            Task DeleteAsync(int id);
        }
    }
}
