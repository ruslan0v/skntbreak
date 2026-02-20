// Skntbreak.Core/Interfaces/IBreakQueueNotifier.cs
using Skntbreak.Core.Dto.Queue;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakQueueNotifier
    {
        Task NotifyYourTurnAsync(int userId, int queueEntryId, int durationMinutes, int timeoutSeconds);
        Task NotifyExpiredAsync(int userId, int queueEntryId, int newPosition);
        Task BroadcastQueueUpdateAsync(DateOnly workDate, int group, List<QueueEntryDto> queue, int availableSlots, int currentRound);
        Task BroadcastBreakEndedAsync(DateOnly workDate, int group, int userId, string userName, int breakRound);
    }
}
