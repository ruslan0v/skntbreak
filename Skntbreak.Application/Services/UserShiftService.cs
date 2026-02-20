using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.UserShift;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data.Repositories;

namespace Skntbreak.Application.Services
{
    public class UserShiftService : IUserShiftService
    {
        private readonly IUserShiftRepository _userShiftRepository;
        private readonly IUserRepository _userRepository;
        private readonly IScheduleRepository _scheduleRepository;

        public UserShiftService(
            IUserShiftRepository userShiftRepository,
            IUserRepository userRepository,
            IScheduleRepository scheduleRepository)
        {
            _userShiftRepository = userShiftRepository;
            _userRepository = userRepository;
            _scheduleRepository = scheduleRepository;
        }

        
        public async Task<UserShift> StartShiftAsync(
            int userId,
            int scheduleId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new ArgumentException($"Пользователь с ID {userId} не найден");

            var activeShift = await _userShiftRepository.GetActiveShiftAsync(userId);
            if (activeShift != null)
            {
                throw new InvalidOperationException(
                    $"У вас уже есть активная смена от {activeShift.WorkDate:dd.MM.yyyy}. " +
                    $"Завершите её перед началом новой."
                );
            }

            var mskTime = DateTime.UtcNow.AddHours(3);
            var today = DateOnly.FromDateTime(mskTime);

            var existingShift = await _userShiftRepository.GetByUserAndDateAsync(userId, today);
            if (existingShift != null)
                throw new InvalidOperationException($"У вас уже есть смена на сегодня");

            var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);
            if (schedule == null)
                throw new ArgumentException($"Расписание с ID {scheduleId} не найдено");


            var userShift = new UserShift
            {
                UserId = userId,
                ScheduleId = scheduleId,
                WorkDate = today,
                Group = schedule.ShiftType,
                StartedAt = DateTime.UtcNow
            };

            return await _userShiftRepository.AddAsync(userShift);
        }

        public async Task<List<ColleagueDto>> GetColleaguesAsync(int scheduleId, DateOnly workDate, int currentUserId)
        {
            var shifts = await _userShiftRepository.GetByScheduleAndDateAsync(scheduleId, workDate);

            return shifts
                .Select(s => new ColleagueDto
                {
                    UserId = s.UserId,
                    UserName = s.User?.UserName ?? "Unknown",
                    Group = s.Group.ToString(),
                    IsCurrentUser = s.UserId == currentUserId,
                    ActiveBreaksCount = s.Breaks?.Count(b => b.Status == Core.Enums.BreakStatus.Taken) ?? 0,
                    CompletedBreaksCount = s.Breaks?.Count(b => b.Status == Core.Enums.BreakStatus.Finished) ?? 0
                })
                .OrderBy(c => c.IsCurrentUser ? 0 : 1) // Текущий пользователь первым
                .ThenBy(c => c.UserName)
                .ToList();
        }


        public async Task<UserShift?> GetUserShiftAsync(int userId, DateOnly workDate)
        {
            return await _userShiftRepository.GetByUserAndDateAsync(userId, workDate);
        }

        public async Task<List<UserShift>> GetUserShiftsAsync(int userId)
        {
            var shifts = await _userShiftRepository.GetByUserAsync(userId);
            return shifts.ToList();
        }

        public async Task DeleteUserShiftAsync(int userShiftId, int requestingUserId)
        {
            var userShift = await _userShiftRepository.GetByIdAsync(userShiftId);
            if (userShift == null)
                throw new ArgumentException($"Смена с ID {userShiftId} не найдена");

            if (userShift.UserId != requestingUserId)
                throw new UnauthorizedAccessException("Вы не можете удалить чужую смену");

            await _userShiftRepository.DeleteAsync(userShiftId);
        }

        public async Task<List<UserShift>> GetShiftsByDateAndGroupAsync(DateOnly workDate, ShiftType group)
        {
            var shifts = await _userShiftRepository.GetByDateAndGroupAsync(workDate, group);
            return shifts.ToList();
        }

        public async Task<UserShift> EndShiftAsync(int userId)
        {
            var mskTime = DateTime.UtcNow.AddHours(3);
            var today = DateOnly.FromDateTime(mskTime);
            var userShift = await _userShiftRepository.GetByUserAndDateAsync(userId, today);

            if (userShift == null)
                throw new InvalidOperationException("Нет активной смены на сегодня");

            if (userShift.EndedAt != null)
                throw new InvalidOperationException("Смена уже завершена");

            var activeBreak = userShift.Breaks.FirstOrDefault(b => b.Status == BreakStatus.Taken);
            if (activeBreak != null)
                throw new InvalidOperationException("Завершите текущий перерыв перед окончанием смены");

            userShift.EndedAt = DateTime.UtcNow;
            await _userShiftRepository.UpdateAsync(userShift);

            return userShift;
        }
    }
}
