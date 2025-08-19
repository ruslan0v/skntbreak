using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakRepository
    {
        Task<Break?> GetByIdAsync(int id);
        Task<IEnumerable<Break>> GetAllAsync();
        Task<IEnumerable<Break>> GetActiveBreaksByUserAsync(int userId);
        Task<IEnumerable<Break>> GetActiveBreaksByScheduleAsync(int scheduleId);

        Task<Break> AddAsync(Break brk);
        Task UpdateAsync(Break brk);
        Task DeleteAsync(int id);
    }
}
