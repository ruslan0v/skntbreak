// Skntbreak.Core/Interfaces/IBreakQueueClient.cs
using Skntbreak.Core.Dto.Queue;

namespace Skntbreak.Core.Interfaces
{
    public interface IBreakQueueClient
    {
        Task YourTurn(int queueEntryId, int durationMinutes, int timeoutSeconds);
        Task NotificationExpired(int queueEntryId, int newPosition);
        Task QueueUpdated(List<QueueEntryDto> queue, int availableSlots, int currentRound);
        Task BreakEnded(int userId, string userName, int breakRound);
    }
}
