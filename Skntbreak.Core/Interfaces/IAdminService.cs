using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Skntbreak.Core.Dto.Admin;
using Skntbreak.Core.Dto.BreakPoolDay;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IAdminService
    {
        // Пользователи
        Task<List<AdminUserDto>> GetAllUsers();
        Task<AdminUserDto> GetUserById(int userId);
        Task<AdminUserDto> CreateUser(CreateUserAdminDto request);
        Task<AdminUserDto> UpdateUser(int userId, UpdateUserAdminDto request);
        Task DeleteUser(int userId);

        // Статистика
        Task<DashboardStatsDto> GetDashboardStats();
        Task<List<UserShiftDetailDto>> GetTodayShifts();

        // Расписания
        Task<List<Schedule>> GetAllSchedules();
        Task<Schedule> GetScheduleById(int id);
        Task<Schedule> CreateSchedule(CreateScheduleDto request);
        Task<Schedule> UpdateSchedule(int id, UpdateScheduleDto request);
        Task DeleteSchedule(int id);

        // Пулы перерывов
        Task<List<BreakPoolDayDto>> GetAllBreakPools();
        Task<BreakPoolDayDto> GetBreakPoolByDateAndShift(DateOnly date, ShiftType shift);
        Task<BreakPoolDayDto> CreateOrUpdateBreakPool(CreateBreakPoolDayDto request);
        Task<UserShift> EndUserShiftAsync(int userShiftId);
    }
}
