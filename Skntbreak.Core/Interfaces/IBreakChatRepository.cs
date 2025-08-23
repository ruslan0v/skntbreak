using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;

namespace Skntbreak.Application.Interfaces
{
    public interface IBreakChatRepository
    {
        Task<BreakChat?> GetByIdAsync(int id);
        Task<IEnumerable<BreakChat>> GetAllAsync();
        Task<IEnumerable<BreakChat>> GetByUserAsync(int userId);
        Task<IEnumerable<BreakChat>> GetByScheduleAsync(int scheduleId, DateTime date);

        Task<BreakChat> AddAsync(BreakChat chatBreak);
        Task UpdateAsync(BreakChat chatBreak);
        Task DeleteAsync(int id);
    }
}
