// Skntbreak.Api/Services/BreakQueueNotifier.cs
using Microsoft.AspNetCore.SignalR;
using Skntbreak.Api.Hubs;
using Skntbreak.Core.Dto.Queue;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Services
{
    public class BreakQueueNotifier : IBreakQueueNotifier
    {
        private readonly IHubContext<BreakQueueHub, IBreakQueueClient> _hub;

        public BreakQueueNotifier(IHubContext<BreakQueueHub, IBreakQueueClient> hub)
        {
            _hub = hub;
        }

        public async Task NotifyYourTurnAsync(int userId, int queueEntryId, int durationMinutes, int timeoutSeconds)
        {
            await _hub.Clients.User(userId.ToString())
                .YourTurn(queueEntryId, durationMinutes, timeoutSeconds);
        }

        public async Task NotifyExpiredAsync(int userId, int queueEntryId, int newPosition)
        {
            await _hub.Clients.User(userId.ToString())
                .NotificationExpired(queueEntryId, newPosition);
        }

        public async Task BroadcastQueueUpdateAsync(
            DateOnly workDate, int group, List<QueueEntryDto> queue, int availableSlots, int currentRound)
        {
            string groupKey = $"{workDate:yyyy-MM-dd}_{group}";
            await _hub.Clients.Group(groupKey)
                .QueueUpdated(queue, availableSlots, currentRound);
        }

        public async Task BroadcastBreakEndedAsync(
            DateOnly workDate, int group, int userId, string userName, int breakRound)
        {
            string groupKey = $"{workDate:yyyy-MM-dd}_{group}";
            await _hub.Clients.Group(groupKey)
                .BreakEnded(userId, userName, breakRound);
        }
    }
}
