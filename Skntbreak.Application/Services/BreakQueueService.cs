using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Break;
using Skntbreak.Core.Dto.Queue;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Application.Services
{
    public class BreakQueueService : IBreakQueueService
    {
        private readonly IBreakQueueRepository _queueRepo;
        private readonly IBreakRepository _breakRepo;
        private readonly IUserShiftRepository _userShiftRepo;
        private readonly IBreakPoolDayRepository _poolRepo;
        private readonly IShiftBreakTemplateRepository _templateRepo;
        private readonly IUserRepository _userRepo;
        private readonly IBreakQueueNotifier _notifier;

        private static readonly TimeSpan NotificationTimeout = TimeSpan.FromSeconds(90);
        private static readonly TimeSpan BreakInterval = TimeSpan.Zero;

        public BreakQueueService(IBreakQueueRepository queueRepo, IBreakRepository breakRepo, IUserShiftRepository userShiftRepo, IBreakPoolDayRepository poolRepo, IShiftBreakTemplateRepository templateRepo, IUserRepository userRepo, IBreakQueueNotifier notifier)
        {
            _queueRepo = queueRepo; _breakRepo = breakRepo; _userShiftRepo = userShiftRepo;
            _poolRepo = poolRepo; _templateRepo = templateRepo; _userRepo = userRepo; _notifier = notifier;
        }

        public async Task<QueuePositionDto> EnqueueAsync(int userId, int? durationMinutes = null)
        {
            var userShift = await _userShiftRepo.GetActiveShiftAsync(userId) ?? throw new InvalidOperationException("Нет активной смены");
            int currentRound = await DetermineCurrentRoundAsync(userShift);
            var existing = await _queueRepo.GetUserEntryAsync(userShift.Id, currentRound);
            if (existing != null && (existing.Status == QueueStatus.Waiting || existing.Status == QueueStatus.Notified)) throw new InvalidOperationException("Вы уже в очереди");

            var lastBreak = await _breakRepo.GetLastFinishedBreakByUserAsync(userId);
            if (lastBreak?.EndTime != null)
            {
                var elapsed = DateTime.UtcNow - lastBreak.EndTime.Value;
                if (elapsed < BreakInterval) throw new InvalidOperationException($"Подождите ещё {(int)(BreakInterval - elapsed).TotalMinutes} мин");
            }

            int duration = await ResolveDurationAsync(userShift, durationMinutes);
            await ValidateDurationQuotaAsync(userShift.WorkDate, userShift.Group, duration);

            int maxPos = await _queueRepo.GetMaxPositionAsync(userShift.WorkDate, userShift.Group, currentRound);
            var entry = new BreakQueue { WorkDate = userShift.WorkDate, Group = userShift.Group, BreakRound = currentRound, Position = maxPos + 1, UserShiftId = userShift.Id, DurationMinutes = duration, Status = QueueStatus.Waiting, EnqueuedAt = DateTime.UtcNow, IsPriority = false };
            await _queueRepo.AddAsync(entry);
            await TryNotifyNextAsync(userShift.WorkDate, userShift.Group, currentRound);
            await BroadcastQueueUpdateAsync(userShift.WorkDate, userShift.Group, currentRound);

            return new QueuePositionDto { QueueEntryId = entry.Id, Position = entry.Position, BreakRound = currentRound, DurationMinutes = duration, Status = entry.Status, PeopleAhead = entry.Position - 1, Message = entry.Position - 1 > 0 ? $"Перед вами {entry.Position - 1} чел." : null };
        }

        public async Task<QueueStateDto> GetQueueStateAsync(int userId)
        {
            var userShift = await _userShiftRepo.GetActiveShiftAsync(userId);
            if (userShift == null) return new QueueStateDto { CurrentRound = 0, Queue = new(), AvailableSlots = 0, ActiveBreaks = 0 };

            int currentRound;
            try { currentRound = await DetermineCurrentRoundAsync(userShift); }
            catch
            {
                currentRound = (userShift.Breaks?.Count(b => b.Status == BreakStatus.Finished || b.Status == BreakStatus.Skipped) ?? 0) + 1; if (currentRound > 1) currentRound--;
            }

            var pool = await _poolRepo.GetByDateAndShiftAsync(userShift.WorkDate, userShift.Group) ?? await _poolRepo.AddAsync(new BreakPoolDay { Group = userShift.Group, WorkDate = userShift.WorkDate, TotalBreaks = 5, AvailableBreaks = 5 });
            var queue = await _queueRepo.GetQueueAsync(userShift.WorkDate, userShift.Group, currentRound);
            var shiftsInGroup = await _userShiftRepo.GetByDateAndGroupAsync(userShift.WorkDate, userShift.Group);
            bool roundComplete = await _queueRepo.IsRoundCompleteAsync(userShift.WorkDate, userShift.Group, currentRound, shiftsInGroup.Count());
            var myEntry = queue.FirstOrDefault(q => q.UserShiftId == userShift.Id);

            return new QueueStateDto { CurrentRound = currentRound, IsRoundComplete = roundComplete, AvailableSlots = pool.AvailableBreaks, ActiveBreaks = pool.TotalBreaks - pool.AvailableBreaks, AllowDurationChoice = userShift.Schedule.AllowDurationChoice, Remaining10Min = pool.Remaining10MinBreaks, Remaining20Min = pool.Remaining20MinBreaks, Queue = queue.Select(q => new QueueEntryDto { Id = q.Id, UserId = q.UserShift.UserId, UserName = q.UserShift.User.UserName, Position = q.Position, DurationMinutes = q.DurationMinutes, Status = q.Status, IsPriority = q.IsPriority, EnqueuedAt = q.EnqueuedAt, NotifiedAt = q.NotifiedAt }).ToList(), MyEntry = myEntry == null ? null : new QueueEntryDto { Id = myEntry.Id, UserId = myEntry.UserShift.UserId, UserName = myEntry.UserShift.User.UserName, Position = myEntry.Position, DurationMinutes = myEntry.DurationMinutes, Status = myEntry.Status, IsPriority = myEntry.IsPriority, EnqueuedAt = myEntry.EnqueuedAt, NotifiedAt = myEntry.NotifiedAt } };
        }

        public async Task<ActiveBreakDto> ConfirmBreakAsync(int userId, int queueEntryId)
        {
            var entry = await _queueRepo.GetByIdAsync(queueEntryId) ?? throw new ArgumentException("Запись не найдена");
            if (entry.UserShift.UserId != userId) throw new UnauthorizedAccessException("Это не ваша запись");
            if (entry.Status != QueueStatus.Notified) throw new InvalidOperationException("Уведомление не активно");

            var userShift = entry.UserShift;

            // Concurrency Retry Loop для слотов пула
            bool saved = false;
            int retries = 3;
            while (!saved && retries > 0)
            {
                try
                {
                    var pool = await _poolRepo.GetByDateAndShiftAsync(entry.WorkDate, entry.Group);
                    if (pool == null || pool.AvailableBreaks <= 0) throw new InvalidOperationException("Нет свободных слотов");

                    pool.AvailableBreaks -= 1;
                    if (entry.DurationMinutes == 10 && pool.Remaining10MinBreaks.HasValue) { if (pool.Remaining10MinBreaks.Value <= 0) throw new InvalidOperationException("10-мин закончились"); pool.Remaining10MinBreaks -= 1; }
                    else if (entry.DurationMinutes == 20 && pool.Remaining20MinBreaks.HasValue) { if (pool.Remaining20MinBreaks.Value <= 0) throw new InvalidOperationException("20-мин закончились"); pool.Remaining20MinBreaks -= 1; }

                    await _poolRepo.UpdateAsync(pool);
                    saved = true;
                }
                catch (DbUpdateConcurrencyException)
                {
                    retries--;
                    if (retries == 0) throw new InvalidOperationException("Высокая нагрузка, не удалось зарезервировать слот.");
                }
            }

            var newBreak = new Break { UserShiftId = userShift.Id, DurationMinutes = entry.DurationMinutes, BreakNumber = entry.BreakRound, Status = BreakStatus.Taken, StartTime = DateTime.UtcNow, WorkDate = entry.WorkDate };
            var createdBreak = await _breakRepo.AddAsync(newBreak);

            entry.Status = QueueStatus.Confirmed;
            await _queueRepo.UpdateAsync(entry);
            await TryNotifyNextAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            await BroadcastQueueUpdateAsync(entry.WorkDate, entry.Group, entry.BreakRound);

            return new ActiveBreakDto { Id = createdBreak.Id, UserId = userId, UserShiftId = createdBreak.UserShiftId, Status = createdBreak.Status, DurationMinutes = createdBreak.DurationMinutes, BreakNumber = createdBreak.BreakNumber, StartTime = createdBreak.StartTime, WorkDate = createdBreak.WorkDate, UserName = userShift.User?.UserName ?? "Unknown" };
        }

        public async Task<QueuePositionDto> PostponeAsync(int userId, int queueEntryId)
        {
            var entry = await _queueRepo.GetByIdAsync(queueEntryId) ?? throw new ArgumentException("Запись не найдена");
            if (entry.UserShift.UserId != userId) throw new UnauthorizedAccessException("Это не ваша запись");
            if (entry.Status != QueueStatus.Notified) throw new InvalidOperationException("Уведомление не активно");

            var queue = await _queueRepo.GetQueueAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            var waitingAfter = queue.Where(q => q.Status == QueueStatus.Waiting && q.Position > entry.Position).OrderBy(q => q.Position).ToList();

            if (waitingAfter.Count > 0)
            {
                int skipCount = Math.Min(2, waitingAfter.Count);
                var toShift = waitingAfter.Take(skipCount).ToList();
                foreach (var q in toShift) q.Position -= 1;
                await _queueRepo.UpdateRangeAsync(toShift);
                entry.Position = toShift.Last().Position + 1;
            }

            entry.Status = QueueStatus.Waiting;
            entry.NotifiedAt = null;
            await _queueRepo.UpdateAsync(entry);

            await TryNotifyNextAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            await BroadcastQueueUpdateAsync(entry.WorkDate, entry.Group, entry.BreakRound);

            return new QueuePositionDto
            {
                QueueEntryId = entry.Id,
                Position = entry.Position,
                BreakRound = entry.BreakRound,
                DurationMinutes = entry.DurationMinutes,
                Status = entry.Status,
                PeopleAhead = queue.Count(q => q.Position < entry.Position && q.Id != entry.Id && (q.Status == QueueStatus.Waiting || q.Status == QueueStatus.Notified)),
                Message = "Отложено"
            };
        }

        public async Task ExpireNotificationAsync(int queueEntryId)
        {
            var entry = await _queueRepo.GetByIdAsync(queueEntryId);
            if (entry == null || entry.Status != QueueStatus.Notified) return;
            if (entry.NotifiedAt.HasValue && DateTime.UtcNow - entry.NotifiedAt.Value < NotificationTimeout) return;
            int maxPos = await _queueRepo.GetMaxPositionAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            entry.Position = maxPos + 1; entry.Status = QueueStatus.Waiting; entry.NotifiedAt = null;
            await _queueRepo.UpdateAsync(entry);
            await TryNotifyNextAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            await BroadcastQueueUpdateAsync(entry.WorkDate, entry.Group, entry.BreakRound);
            await _notifier.NotifyExpiredAsync(entry.UserShift.UserId, entry.Id, entry.Position);
        }

        public async Task<QueuePositionDto> EnqueuePriorityAsync(int targetUserId, int requestingUserId, int? durationMinutes = null)
        {
            var requester = await _userRepo.GetByIdAsync(requestingUserId) ?? throw new ArgumentException("Запросивший не найден");
            if (requester.Role != RoleType.TeamLead && requester.Role != RoleType.Admin) throw new UnauthorizedAccessException("Недостаточно прав");
            var userShift = await _userShiftRepo.GetActiveShiftAsync(targetUserId) ?? throw new InvalidOperationException("Нет активной смены");

            int currentRound;
            try { currentRound = await DetermineCurrentRoundAsync(userShift); } catch { currentRound = 1; }
            int duration = await ResolveDurationAsync(userShift, durationMinutes);

            var queue = await _queueRepo.GetQueueAsync(userShift.WorkDate, userShift.Group, currentRound);
            var toShift = queue.Where(q => q.Status == QueueStatus.Waiting || q.Status == QueueStatus.Notified).ToList();
            foreach (var q in toShift) q.Position += 1;
            await _queueRepo.UpdateRangeAsync(toShift);

            var entry = new BreakQueue { WorkDate = userShift.WorkDate, Group = userShift.Group, BreakRound = currentRound, Position = 1, UserShiftId = userShift.Id, DurationMinutes = duration, Status = QueueStatus.Waiting, EnqueuedAt = DateTime.UtcNow, IsPriority = true };
            await _queueRepo.AddAsync(entry);
            await TryNotifyNextAsync(userShift.WorkDate, userShift.Group, currentRound);
            await BroadcastQueueUpdateAsync(userShift.WorkDate, userShift.Group, currentRound);

            return new QueuePositionDto { QueueEntryId = entry.Id, Position = 1, BreakRound = currentRound, DurationMinutes = duration, Status = entry.Status, PeopleAhead = 0, Message = "Приоритетная постановка" };
        }

        public async Task SkipBreakRoundAsync(int userId)
        {
            var userShift = await _userShiftRepo.GetActiveShiftAsync(userId) ?? throw new InvalidOperationException("Нет активной смены");
            int currentRound = await DetermineCurrentRoundAsync(userShift);
            var existing = await _queueRepo.GetUserEntryAsync(userShift.Id, currentRound);
            if (existing != null && (existing.Status == QueueStatus.Waiting || existing.Status == QueueStatus.Notified))
            {
                existing.Status = QueueStatus.Cancelled;
                await _queueRepo.UpdateAsync(existing);
            }
            var skipBreak = new Break { UserShiftId = userShift.Id, DurationMinutes = 0, BreakNumber = currentRound, Status = BreakStatus.Skipped, StartTime = DateTime.UtcNow, EndTime = DateTime.UtcNow, WorkDate = userShift.WorkDate };
            await _breakRepo.AddAsync(skipBreak);
            await TryNotifyNextAsync(userShift.WorkDate, userShift.Group, currentRound);
            await BroadcastQueueUpdateAsync(userShift.WorkDate, userShift.Group, currentRound);
        }

        public async Task ProcessNextInQueueAsync(DateOnly workDate, ShiftType group, int breakRound)
        {
            await TryNotifyNextAsync(workDate, group, breakRound);
            await BroadcastQueueUpdateAsync(workDate, group, breakRound);
        }

        private async Task<int> DetermineCurrentRoundAsync(UserShift userShift)
        {
            var userBreakRounds = userShift.Breaks?.Where(b => b.Status == BreakStatus.Finished || b.Status == BreakStatus.Skipped).Select(b => b.BreakNumber).Distinct().Count() ?? 0;
            int nextRound = userBreakRounds + 1;
            if (nextRound > 1)
            {
                var shiftsInGroup = await _userShiftRepo.GetByDateAndGroupAsync(userShift.WorkDate, userShift.Group);
                bool prevComplete = await _queueRepo.IsRoundCompleteAsync(userShift.WorkDate, userShift.Group, nextRound - 1, shiftsInGroup.Count());
                if (!prevComplete) throw new InvalidOperationException($"Раунд {nextRound - 1} ещё не завершён");
            }
            return nextRound;
        }

        // ИСПРАВЛЕНО: Вычисляем длительность на основе фактически завершенных перерывов (игнорируя Skipped)
        private async Task<int> ResolveDurationAsync(UserShift userShift, int? requested)
        {
            if (userShift.Schedule.AllowDurationChoice)
            {
                if (requested == null || (requested != 10 && requested != 20)) throw new InvalidOperationException("Выберите 10 или 20 минут");
                return requested.Value;
            }
            int actualFinishedBreaks = userShift.Breaks?.Count(b => b.Status == BreakStatus.Finished) ?? 0;
            var templates = await _templateRepo.GetByScheduleAsync(userShift.ScheduleId);
            var template = templates.FirstOrDefault(t => t.Order == actualFinishedBreaks + 1);
            return template?.DurationMinutes ?? 20;
        }

        private async Task ValidateDurationQuotaAsync(DateOnly workDate, ShiftType group, int duration)
        {
            var pool = await _poolRepo.GetByDateAndShiftAsync(workDate, group);
            if (pool == null) return;
            if (duration == 10 && pool.Remaining10MinBreaks.HasValue && pool.Remaining10MinBreaks.Value <= 0) throw new InvalidOperationException("10-минутные перерывы закончились");
            if (duration == 20 && pool.Remaining20MinBreaks.HasValue && pool.Remaining20MinBreaks.Value <= 0) throw new InvalidOperationException("20-минутные перерывы закончились");
        }

        // ИСПРАВЛЕНО: Использование оптимизированного метода GetNextEligibleWaitingAsync без проблемы N+1
        private async Task TryNotifyNextAsync(DateOnly workDate, ShiftType group, int breakRound)
        {
            bool hasNotified = await _queueRepo.HasNotifiedEntryAsync(workDate, group, breakRound);
            if (hasNotified) return;

            var pool = await _poolRepo.GetByDateAndShiftAsync(workDate, group);
            if (pool == null || pool.AvailableBreaks <= 0) return;

            var next = await _queueRepo.GetNextEligibleWaitingAsync(workDate, group, breakRound, BreakInterval);
            if (next == null) return;

            next.Status = QueueStatus.Notified;
            next.NotifiedAt = DateTime.UtcNow;
            await _queueRepo.UpdateAsync(next);
            await _notifier.NotifyYourTurnAsync(next.UserShift.UserId, next.Id, next.DurationMinutes, 90);
        }

        private async Task BroadcastQueueUpdateAsync(DateOnly workDate, ShiftType group, int breakRound)
        {
            var queue = await _queueRepo.GetQueueAsync(workDate, group, breakRound);
            var pool = await _poolRepo.GetByDateAndShiftAsync(workDate, group);
            var queueDto = queue.Select(q => new QueueEntryDto { Id = q.Id, UserId = q.UserShift.UserId, UserName = q.UserShift.User.UserName, Position = q.Position, DurationMinutes = q.DurationMinutes, Status = q.Status, IsPriority = q.IsPriority, EnqueuedAt = q.EnqueuedAt, NotifiedAt = q.NotifiedAt }).ToList();
            await _notifier.BroadcastQueueUpdateAsync(workDate, (int)group, queueDto, pool?.AvailableBreaks ?? 0, breakRound);
        }
    }
}