using Skntbreak.Core.Dto.Queue;
using Skntbreak.Core.Dto.Break;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakQueueService
    {
        Task<QueuePositionDto> EnqueueAsync(int userId, int? durationMinutes = null);
        Task<QueueStateDto> GetQueueStateAsync(int userId);
        Task<ActiveBreakDto> ConfirmBreakAsync(int userId, int queueEntryId);
        Task<QueuePositionDto> PostponeAsync(int userId, int queueEntryId);
        Task ExpireNotificationAsync(int queueEntryId);
        Task<QueuePositionDto> EnqueuePriorityAsync(int targetUserId, int requestingUserId, int? durationMinutes = null);
        Task SkipBreakRoundAsync(int userId);
        Task ProcessNextInQueueAsync(DateOnly workDate, ShiftType group, int breakRound);
    }
}
