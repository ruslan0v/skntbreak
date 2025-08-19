using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;

namespace Skntbreak.Core.Interfaces
{
    namespace Skntbreak.Application.Interfaces
    {
        public interface IBreakRuleRepository
        {
            Task<BreakRule?> GetByIdAsync(int id);
            Task<IEnumerable<BreakRule>> GetAllAsync();
            Task<IEnumerable<BreakRule>> GetByScheduleAsync(int scheduleId);

            Task<BreakRule> AddAsync(BreakRule rule);
            Task UpdateAsync(BreakRule rule);
            Task DeleteAsync(int id);
        }
    }
}
