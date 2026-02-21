using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Services
{
    public class BreakAutoCloserService : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly ILogger<BreakAutoCloserService> _logger;

        public BreakAutoCloserService(IServiceProvider services, ILogger<BreakAutoCloserService> logger)
        {
            _services = services;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Сервис автозавершения перерывов (BreakAutoCloserService) запущен.");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _services.CreateScope();
                    var breakRepo = scope.ServiceProvider.GetRequiredService<IBreakRepository>();
                    var breakService = scope.ServiceProvider.GetRequiredService<IBreakService>();

                    var activeBreaks = (await breakRepo.GetAllAsync())
                       .Where(b => b.Status == BreakStatus.Taken).ToList();

                    foreach (var b in activeBreaks)
                    {
                        var elapsed = DateTime.UtcNow - b.StartTime;
                        if (elapsed.TotalMinutes >= b.DurationMinutes)
                        {
                            _logger.LogInformation($"Автоматическое завершение перерыва {b.Id} для пользователя {b.UserShift.UserId}. Время вышло.");
                            // Использование инкапсулированного сервиса гарантирует возврат слотов в пул и пуш очереди
                            await breakService.EndBreakAsync(b.Id, b.UserShift.UserId);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Критическая ошибка в BreakAutoCloserService.");
                }

                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
            }
        }
    }
}