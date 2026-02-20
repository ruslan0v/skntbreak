using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Skntbreak.Core.Dto.Break;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakService
    {
        Task<ActiveBreakDto> StartBreakAsync(StartBreakDto request, int userId);
        Task<BreakDetailsDto> SkipBreakAsync(SkipBreakDto request, int userId);
        Task<BreakDetailsDto> EndBreakAsync(int breakId, int userId);
        Task<BreakDetailsDto> SkipBreakAsync(int breakId, int userId);
        Task<List<ActiveBreakDto>> GetActiveBreaksAsync();
        Task<List<ActiveBreakDto>> GetActiveBreaksByScheduleAsync(int scheduleId);
        Task<ActiveBreakDto?> GetUserActiveBreakAsync(int userId);
        Task<List<BreakDetailsDto>> GetUserBreakHistoryAsync(int userId, DateOnly date);
        Task<BreakStatisticsDto> GetBreakStatisticsAsync(int userId, DateOnly date);
        Task<BreakStatisticsDto> GetScheduleStatisticsAsync(int scheduleId, DateOnly date);
        Task InitializeUserShiftBreaksAsync(int userShiftId);
        Task<List<BreakDetailsDto>> GetAvailableBreaksAsync(int userId, DateOnly date);
        Task<List<ActiveBreakDto>> GetActiveBreaksByDateAsync(DateOnly workDate, int currentUserId);

        // НОВЫЙ МЕТОД
        Task<BreakPoolInfoDto> GetBreakPoolInfoAsync(DateOnly workDate, int userId);
    }
}
