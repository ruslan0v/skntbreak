using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Skntbreak.Core.Interfaces;
using Skntbreak.Core.Dto.Queue;


namespace Skntbreak.Api.Hubs
{
    [Authorize]
    public class BreakQueueHub : Hub<IBreakQueueClient>
    {
        private readonly IUserShiftRepository _userShiftRepo;

        public BreakQueueHub(IUserShiftRepository userShiftRepo)
        {
            _userShiftRepo = userShiftRepo;
        }

        public override async Task OnConnectedAsync()
        {
            var userIdStr = Context.User?.FindFirst("userId")?.Value;
            if (int.TryParse(userIdStr, out var userId))
            {
                // Автоматически подписываем на группу текущей смены
                var activeShift = await _userShiftRepo.GetActiveShiftAsync(userId);
                if (activeShift != null)
                {
                    string groupKey = $"{activeShift.WorkDate:yyyy-MM-dd}_{(int)activeShift.Group}";
                    await Groups.AddToGroupAsync(Context.ConnectionId, groupKey);
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Группы автоматически очищаются при дисконнекте
            await base.OnDisconnectedAsync(exception);
        }

        // Клиент может вручную подписаться на конкретную группу
        public async Task JoinShiftGroup(string workDate, int group)
        {
            string groupKey = $"{workDate}_{group}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupKey);
        }

        public async Task LeaveShiftGroup(string workDate, int group)
        {
            string groupKey = $"{workDate}_{group}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupKey);
        }
    }
}