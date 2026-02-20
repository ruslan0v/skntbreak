using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IUserShiftRepository
    {
        Task<UserShift?> GetByIdAsync(int id);
        Task<IEnumerable<UserShift>> GetAllAsync();
        Task<UserShift?> GetByUserAndDateAsync(int userId, DateOnly workDate);
        Task<IEnumerable<UserShift>> GetByUserAsync(int userId);
        Task<IEnumerable<UserShift>> GetByScheduleAsync(int scheduleId);
        Task<IEnumerable<UserShift>> GetByDateAsync(DateOnly workDate);
        Task<IEnumerable<UserShift>> GetByDateAndGroupAsync(DateOnly workDate, ShiftType group);
        Task<UserShift> AddAsync(UserShift userShift);
        Task UpdateAsync(UserShift userShift);
        Task DeleteAsync(int id);
        Task<IEnumerable<UserShift>> GetByScheduleAndDateAsync(int scheduleId, DateOnly date);
        Task<UserShift?> GetActiveShiftAsync(int userId);
    }
}
