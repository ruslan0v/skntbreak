using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Services
{
    public class BreakPoolDaySeeder : BackgroundService
    {
        private readonly IServiceProvider _services;
        private readonly TimeSpan _runAt = new TimeSpan(5, 0, 0);

        public BreakPoolDaySeeder(IServiceProvider services)
        {
            _services = services;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.UtcNow;
                var todayRun = now.Date.Add(_runAt);
                var nextRun = now <= todayRun ? todayRun : todayRun.AddDays(1);

                var delay = nextRun - now;
                if (delay > TimeSpan.Zero)
                {
                    try { await Task.Delay(delay, stoppingToken); }
                    catch (TaskCanceledException) { break; }
                }

                try
                {
                    using var scope = _services.CreateScope();
                    var poolRepo = scope.ServiceProvider.GetRequiredService<IBreakPoolDayRepository>();

                    var date = DateOnly.FromDateTime(nextRun.Date);

                    var day = await poolRepo.GetByDateAndShiftAsync(date, ShiftType.Day);
                    if (day == null)
                    {
                        await poolRepo.AddAsync(new BreakPoolDay
                        {
                            Group = ShiftType.Day,
                            WorkDate = date,
                            TotalBreaks = 5,
                            AvailableBreaks = 5
                        });
                    }

                    var evening = await poolRepo.GetByDateAndShiftAsync(date, ShiftType.Evening);
                    if (evening == null)
                    {
                        await poolRepo.AddAsync(new BreakPoolDay
                        {
                            Group = ShiftType.Evening,
                            WorkDate = date,
                            TotalBreaks = 3,
                            AvailableBreaks = 3
                        });
                    }
                }
                catch
                {
                }
            }
        }
    }
}


