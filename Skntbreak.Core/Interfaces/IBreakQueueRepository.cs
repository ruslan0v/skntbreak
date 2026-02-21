using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakQueueRepository
    {
        Task<BreakQueue?> GetByIdAsync(int id);
        Task<List<BreakQueue>> GetQueueAsync(DateOnly workDate, ShiftType group, int breakRound);
        Task<BreakQueue?> GetUserEntryAsync(int userShiftId, int breakRound);
        Task<BreakQueue?> GetNextWaitingAsync(DateOnly workDate, ShiftType group, int breakRound);
        Task<BreakQueue?> GetNextEligibleWaitingAsync(DateOnly workDate, ShiftType group, int breakRound, TimeSpan interval); // НОВЫЙ МЕТОД
        Task<int> GetMaxPositionAsync(DateOnly workDate, ShiftType group, int breakRound);
        Task<bool> IsRoundCompleteAsync(DateOnly workDate, ShiftType group, int breakRound, int totalUsersInShift);
        Task<List<BreakQueue>> GetExpiredNotificationsAsync(TimeSpan timeout);
        Task<BreakQueue> AddAsync(BreakQueue entry);
        Task UpdateAsync(BreakQueue entry);
        Task UpdateRangeAsync(IEnumerable<BreakQueue> entries);
        Task DeleteAsync(int id);
        Task<int> CountActiveInRoundAsync(DateOnly workDate, ShiftType group, int breakRound);
        Task<bool> HasNotifiedEntryAsync(DateOnly workDate, ShiftType group, int breakRound);
    }
}