using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Break;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Application.Services
{
    public class BreakService : IBreakService
    {
        private readonly IBreakRepository _breakRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUserShiftRepository _userShiftRepository;
        private readonly IBreakPoolDayRepository _poolDayRepository;
        private readonly IBreakQueueService _queueService;

        public BreakService(IBreakRepository breakRepository, IUserRepository userRepository, IUserShiftRepository userShiftRepository, IBreakPoolDayRepository poolDayRepository, IBreakQueueService queueService)
        {
            _breakRepository = breakRepository;
            _userRepository = userRepository;
            _userShiftRepository = userShiftRepository;
            _poolDayRepository = poolDayRepository;
            _queueService = queueService;
        }

        public async Task<ActiveBreakDto> StartBreakAsync(StartBreakDto request, int userId)
        {
            // Жестко запрещаем прямой старт перерывов в обход очереди. ConfirmBreakAsync является легитимным методом.
            throw new InvalidOperationException("Прямой старт перерыва отключен архитектурно. Используйте систему подтверждения в очереди.");
        }

        public async Task<BreakDetailsDto> EndBreakAsync(int breakId, int userId)
        {
            var endedBreak = await _breakRepository.GetByIdAsync(breakId) ?? throw new ArgumentException($"Перерыв с Id {breakId} не найден");
            var userShift = await _userShiftRepository.GetByIdAsync(endedBreak.UserShiftId);

            if (userShift == null || userShift.UserId != userId) throw new UnauthorizedAccessException("Это не ваш перерыв");
            if (endedBreak.Status != BreakStatus.Taken) throw new InvalidOperationException($"Перерыв не активен (статус: {endedBreak.Status})");

            // Optimistic Concurrency Control Retry Loop
            bool saved = false;
            int retries = 3;
            while (!saved && retries > 0)
            {
                try
                {
                    var pool = await _poolDayRepository.GetByDateAndShiftAsync(endedBreak.WorkDate, userShift.Group);
                    if (pool != null)
                    {
                        pool.AvailableBreaks += 1;
                        if (endedBreak.DurationMinutes == 10 && pool.Remaining10MinBreaks.HasValue) pool.Remaining10MinBreaks += 1;
                        else if (endedBreak.DurationMinutes == 20 && pool.Remaining20MinBreaks.HasValue) pool.Remaining20MinBreaks += 1;
                        await _poolDayRepository.UpdateAsync(pool);
                    }
                    saved = true;
                }
                catch (DbUpdateConcurrencyException)
                {
                    retries--;
                    if (retries == 0) throw new InvalidOperationException("Не удалось обновить квоты из-за высокой нагрузки. Попробуйте еще раз.");
                }
            }

            endedBreak.Status = BreakStatus.Finished;
            endedBreak.EndTime = DateTime.UtcNow;
            await _breakRepository.UpdateAsync(endedBreak);

            await _queueService.ProcessNextInQueueAsync(endedBreak.WorkDate, userShift.Group, endedBreak.BreakNumber);

            return new BreakDetailsDto
            {
                Id = endedBreak.Id,
                UserId = userId,
                UserShiftId = endedBreak.UserShiftId,
                Status = endedBreak.Status,
                DurationMinutes = endedBreak.DurationMinutes,
                BreakNumber = endedBreak.BreakNumber,
                StartTime = endedBreak.StartTime,
                EndTime = endedBreak.EndTime,
                WorkDate = endedBreak.WorkDate
            };
        }

        public async Task<BreakDetailsDto> SkipBreakAsync(SkipBreakDto request, int userId)
        {
            var userShift = await _userShiftRepository.GetActiveShiftAsync(userId) ?? throw new InvalidOperationException("Пользователь не начал смену");

            var newBreak = new Break
            {
                UserShiftId = userShift.Id,
                DurationMinutes = request.DurationMinutes,
                BreakNumber = request.BreakNumber,
                Status = BreakStatus.Skipped,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow,
                WorkDate = userShift.WorkDate
            };
            var skippedBreak = await _breakRepository.AddAsync(newBreak);
            return new BreakDetailsDto { /* mapping */ Id = skippedBreak.Id, UserId = userId, UserShiftId = skippedBreak.UserShiftId, Status = skippedBreak.Status, DurationMinutes = skippedBreak.DurationMinutes, BreakNumber = skippedBreak.BreakNumber, StartTime = skippedBreak.StartTime, EndTime = skippedBreak.EndTime, WorkDate = skippedBreak.WorkDate };
        }

        public async Task<BreakDetailsDto> SkipBreakAsync(int breakId, int userId)
        {
            var breakEntity = await _breakRepository.GetByIdAsync(breakId);
            if (breakEntity == null) throw new ArgumentException($"Перерыв с Id {breakId} не найден");
            breakEntity.Status = BreakStatus.Skipped;
            breakEntity.EndTime = DateTime.UtcNow;
            await _breakRepository.UpdateAsync(breakEntity);
            return new BreakDetailsDto { /* mapping */ Id = breakEntity.Id, UserId = userId, UserShiftId = breakEntity.UserShiftId, Status = breakEntity.Status, DurationMinutes = breakEntity.DurationMinutes, BreakNumber = breakEntity.BreakNumber, StartTime = breakEntity.StartTime, EndTime = breakEntity.EndTime, WorkDate = breakEntity.WorkDate };
        }

        public async Task<List<ActiveBreakDto>> GetActiveBreaksAsync()
        {
            var breaks = await _breakRepository.GetAllAsync();
            return breaks.Where(b => b.Status == BreakStatus.Taken).Select(b => new ActiveBreakDto { /* mapping */ Id = b.Id, UserId = b.UserShift.UserId, UserShiftId = b.UserShiftId, Status = b.Status, DurationMinutes = b.DurationMinutes, BreakNumber = b.BreakNumber, StartTime = b.StartTime, WorkDate = b.WorkDate, UserName = b.UserShift?.User?.UserName ?? "Unknown" }).ToList();
        }

        public async Task<List<ActiveBreakDto>> GetActiveBreaksByScheduleAsync(int scheduleId)
        {
            var breaks = await _breakRepository.GetActiveBreaksByScheduleAsync(scheduleId);
            return breaks.Select(b => new ActiveBreakDto { /* mapping */ Id = b.Id, UserId = b.UserShift.UserId, UserShiftId = b.UserShiftId, Status = b.Status, DurationMinutes = b.DurationMinutes, BreakNumber = b.BreakNumber, StartTime = b.StartTime, WorkDate = b.WorkDate, UserName = b.UserShift?.User?.UserName ?? "Unknown" }).ToList();
        }

        public async Task<ActiveBreakDto?> GetUserActiveBreakAsync(int userId)
        {
            var breakEntity = await _breakRepository.GetActiveBreakByUserAsync(userId);
            if (breakEntity == null) return null;
            return new ActiveBreakDto { /* mapping */ Id = breakEntity.Id, UserId = userId, UserShiftId = breakEntity.UserShiftId, Status = breakEntity.Status, DurationMinutes = breakEntity.DurationMinutes, BreakNumber = breakEntity.BreakNumber, StartTime = breakEntity.StartTime, WorkDate = breakEntity.WorkDate, UserName = breakEntity.UserShift?.User?.UserName ?? "Unknown" };
        }

        public async Task<List<BreakDetailsDto>> GetUserBreakHistoryAsync(int userId, DateOnly date)
        {
            var userShift = await _userShiftRepository.GetByUserAndDateAsync(userId, date);
            if (userShift == null) return new List<BreakDetailsDto>();
            var breaks = await _breakRepository.GetAllAsync();
            return breaks.Where(b => b.UserShiftId == userShift.Id).OrderBy(b => b.StartTime).Select(b => new BreakDetailsDto { /* mapping */ Id = b.Id, UserId = userId, UserShiftId = b.UserShiftId, Status = b.Status, DurationMinutes = b.DurationMinutes, BreakNumber = b.BreakNumber, StartTime = b.StartTime, EndTime = b.EndTime, WorkDate = b.WorkDate }).ToList();
        }

        public async Task<BreakStatisticsDto> GetBreakStatisticsAsync(int userId, DateOnly date)
        {
            var breaks = await GetUserBreakHistoryAsync(userId, date);
            var user = await _userRepository.GetByIdAsync(userId);
            return new BreakStatisticsDto { UserId = userId, UserName = user?.UserName ?? "Unknown", WorkDate = date, TotalBreaks = breaks.Count, CompletedBreaks = breaks.Count(b => b.Status == BreakStatus.Finished), ActiveBreaks = breaks.Count(b => b.Status == BreakStatus.Taken), OverdueBreaks = breaks.Count(b => b.EndTime.HasValue && b.EndTime.Value > b.StartTime.AddMinutes(b.DurationMinutes)), TotalBreakTime = TimeSpan.FromMinutes(breaks.Where(b => b.Status == BreakStatus.Finished && b.EndTime.HasValue).Sum(b => (b.EndTime!.Value - b.StartTime).TotalMinutes)), AverageBreakTime = breaks.Any(b => b.Status == BreakStatus.Finished && b.EndTime.HasValue) ? TimeSpan.FromMinutes(breaks.Where(b => b.Status == BreakStatus.Finished && b.EndTime.HasValue).Average(b => (b.EndTime!.Value - b.StartTime).TotalMinutes)) : TimeSpan.Zero, BreaksByStatus = breaks.GroupBy(b => b.Status).ToDictionary(g => g.Key, g => g.Count()) };
        }

        public async Task<BreakStatisticsDto> GetScheduleStatisticsAsync(int scheduleId, DateOnly date)
        {
            var breaks = await _breakRepository.GetAllAsync();
            var scheduleBreaks = breaks.Where(b => b.UserShift.ScheduleId == scheduleId && b.WorkDate == date).ToList();
            return new BreakStatisticsDto { WorkDate = date, TotalBreaks = scheduleBreaks.Count, CompletedBreaks = scheduleBreaks.Count(b => b.Status == BreakStatus.Finished), ActiveBreaks = scheduleBreaks.Count(b => b.Status == BreakStatus.Taken), OverdueBreaks = scheduleBreaks.Count(b => b.EndTime.HasValue && b.EndTime.Value > b.StartTime.AddMinutes(b.DurationMinutes)), BreaksByStatus = scheduleBreaks.GroupBy(b => b.Status).ToDictionary(g => g.Key, g => g.Count()) };
        }

        public async Task InitializeUserShiftBreaksAsync(int userShiftId) { await Task.CompletedTask; }

        public async Task<List<BreakDetailsDto>> GetAvailableBreaksAsync(int userId, DateOnly date)
        {
            var userShift = await _userShiftRepository.GetByUserAndDateAsync(userId, date);
            if (userShift == null) return new List<BreakDetailsDto>();
            var breaks = await _breakRepository.GetAllAsync();
            return breaks.Where(b => b.UserShiftId == userShift.Id && b.Status == BreakStatus.Available).Select(b => new BreakDetailsDto { Id = b.Id, UserId = userId, UserShiftId = b.UserShiftId, Status = b.Status, DurationMinutes = b.DurationMinutes, BreakNumber = b.BreakNumber, StartTime = b.StartTime, EndTime = b.EndTime, WorkDate = b.WorkDate }).ToList();
        }

        public async Task<List<ActiveBreakDto>> GetActiveBreaksByDateAsync(DateOnly workDate, int currentUserId)
        {
            var userShift = await _userShiftRepository.GetByUserAndDateAsync(currentUserId, workDate);
            if (userShift == null) return new List<ActiveBreakDto>();
            var activeBreaks = await _breakRepository.GetBreaksByDateAndGroupAsync(workDate, userShift.Group);
            return activeBreaks.Where(b => b.Status == BreakStatus.Taken).Select(b => new ActiveBreakDto { Id = b.Id, UserId = b.UserShift.UserId, UserShiftId = b.UserShiftId, Status = b.Status, DurationMinutes = b.DurationMinutes, BreakNumber = b.BreakNumber, StartTime = b.StartTime, WorkDate = b.WorkDate, UserName = b.UserShift?.User?.UserName ?? "Unknown" }).OrderBy(b => b.StartTime).ToList();
        }

        public async Task<BreakPoolInfoDto> GetBreakPoolInfoAsync(DateOnly workDate, int userId)
        {
            var userShift = await _userShiftRepository.GetByUserAndDateAsync(userId, workDate);
            if (userShift == null) return new BreakPoolInfoDto { TotalBreaks = 0, AvailableBreaks = 0, ActiveBreaks = 0, CanTakeBreak = false, Message = "У вас нет активной смены на эту дату" };
            var pool = await _poolDayRepository.GetByDateAndShiftAsync(workDate, userShift.Group);
            if (pool == null) return new BreakPoolInfoDto { TotalBreaks = 0, AvailableBreaks = 0, ActiveBreaks = 0, CanTakeBreak = false, Message = "Пул перерывов не настроен" };

            var hasActiveBreak = await _breakRepository.GetActiveBreakByUserAsync(userId) != null;
            var intervalPassed = await IsIntervalPassed(userId);

            var canTake = pool.AvailableBreaks > 0 && !hasActiveBreak && intervalPassed;
            string? message = null;
            if (hasActiveBreak) message = "У вас уже есть активный перерыв";
            else if (!intervalPassed) message = "Необходимо подождать 60 минут после последнего перерыва";
            else if (pool.AvailableBreaks <= 0) message = "Все перерывы заняты";

            return new BreakPoolInfoDto { TotalBreaks = pool.TotalBreaks, AvailableBreaks = pool.AvailableBreaks, ActiveBreaks = pool.TotalBreaks - pool.AvailableBreaks, CanTakeBreak = canTake, Message = message };
        }

        private async Task<int> GetNextBreakNumberAsync(int usershiftId)
        {
            var lastBreak = await _breakRepository.GetLastBreakByUserShiftAsync(usershiftId);
            return lastBreak?.BreakNumber + 1 ?? 1;
        }

        public async Task<bool> IsIntervalPassed(int userId)
        {
            var lastFinishedBreak = await _breakRepository.GetLastFinishedBreakByUserAsync(userId);
            if (lastFinishedBreak == null) return true;
            return (DateTime.UtcNow - lastFinishedBreak.EndTime.Value).TotalMinutes >= 60;
        }
    }
}