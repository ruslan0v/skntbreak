using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Services
{
    public class QueueNotificationWatcher : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<QueueNotificationWatcher> _logger;
        private static readonly TimeSpan CheckInterval = TimeSpan.FromSeconds(15);
        private static readonly TimeSpan Timeout = TimeSpan.FromSeconds(90);

        public QueueNotificationWatcher(
            IServiceProvider services,
            ILogger<QueueNotificationWatcher> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("QueueNotificationWatcher запущен");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(CheckInterval, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }

                try
                {
                    using var scope = _services.CreateScope();
                    var queueRepo = scope.ServiceProvider
                        .GetRequiredService<IBreakQueueRepository>();
                    var queueService = scope.ServiceProvider
                        .GetRequiredService<IBreakQueueService>();

                    var expired = await queueRepo.GetExpiredNotificationsAsync(Timeout);

                    foreach (var entry in expired)
                    {
                        _logger.LogInformation(
                            "Тайм-аут уведомления для QueueEntry {Id}, User {UserId}",
                            entry.Id, entry.UserShift?.UserId);

                        await queueService.ExpireNotificationAsync(entry.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка в QueueNotificationWatcher");
                }
            }
        }
    }
}