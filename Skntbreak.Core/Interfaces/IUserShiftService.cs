using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Skntbreak.Core.Dto.UserShift;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IUserShiftService
    {
        Task<UserShift> StartShiftAsync(int userId, int scheduleId);
        //Task<UserShift> StartShiftAutoAsync(int userId); // Новый метод
        Task<UserShift?> GetUserShiftAsync(int userId, DateOnly workDate);
        Task<List<UserShift>> GetUserShiftsAsync(int userId);
        Task DeleteUserShiftAsync(int userShiftId, int requestingUserId);
        Task<List<UserShift>> GetShiftsByDateAndGroupAsync(DateOnly workDate, ShiftType group);
        Task<List<ColleagueDto>> GetColleaguesAsync(int scheduleId, DateOnly workDate, int currentUserId);
        Task<UserShift> EndShiftAsync(int userId);
    }
}
