using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakRepository
    {
        Task<Break?> GetByIdAsync(int id);
        Task<IEnumerable<Break>> GetAllAsync();
        Task<IEnumerable<Break>> GetActiveBreaksByUserAsync(int userId);
        Task<Break> GetActiveBreakByUserAsync(int userId);
        Task<IEnumerable<Break>> GetActiveBreaksByScheduleAsync(int scheduleId);
        Task<Break?> GetAvailableBreakAsync(int userShiftId);
        Task<Break?> GetLastFinishedBreakByUserAsync(int userId);
        Task<Break?> GetNextAvailableBreakByUserAsync(int userId);
        Task<Break?> GetLastBreakByUserAsync(int userId);
        Task<Break?> GetLastBreakByUserShiftAsync(int userShiftId);
        Task<Break?> GetActiveBreakByUserShiftAsync(int userShiftId);

        Task<IEnumerable<Break>> GetBreaksByDateAndGroupAsync(DateOnly workDate, ShiftType group);
        Task<Break> AddAsync(Break brk);
        Task UpdateAsync(Break brk);
        Task DeleteAsync(int id);
    }
}
