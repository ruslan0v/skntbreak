using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Admin;
using Skntbreak.Core.Dto.BreakPoolDay;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Dto.Users;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data.Repositories;

namespace Skntbreak.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserShiftRepository _userShiftRepository;
        private readonly IBreakRepository _breakRepository;
        private readonly IScheduleRepository _scheduleRepository;
        private readonly IBreakPoolDayRepository _breakPoolDayRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IBreakService _breakService;

        public AdminService(
            IUserRepository userRepository,
            IUserShiftRepository userShiftRepository,
            IBreakRepository breakRepository,
            IScheduleRepository scheduleRepository,
            IBreakPoolDayRepository breakPoolDayRepository,
            IPasswordHasher passwordHasher,
            IBreakService breakService)
        {
            _userRepository = userRepository;
            _userShiftRepository = userShiftRepository;
            _breakRepository = breakRepository;
            _scheduleRepository = scheduleRepository;
            _breakPoolDayRepository = breakPoolDayRepository;
            _passwordHasher = passwordHasher;
            _breakService = breakService;
        }

        // ==================== ПОЛЬЗОВАТЕЛИ ====================

        public async Task<List<AdminUserDto>> GetAllUsers()
        {
            var users = await _userRepository.GetAllWithShiftsAndBreaksAsync();
            var userDtos = users.Select(user =>
            {
                var allBreaks = user.UserShifts.SelectMany(s => s.Breaks).ToList();

                return new AdminUserDto
                {
                    Id = user.Id,
                    UserName = user.UserName,
                    Login = user.Login,
                    Role = user.Role.ToString(),
                    TotalShifts = user.UserShifts.Count(),
                    TotalBreaks = allBreaks.Count,
                    CompletedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Finished),
                    SkippedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Skipped)
                };
            }).ToList();

            return userDtos;
        }

        public async Task<AdminUserDto> GetUserById(int userId)
        {
            var user = await _userRepository.GetByIdWithShiftsAndBreaksAsync(userId);
            if (user == null)
                throw new Exception($"Пользователь с ID {userId} не найден");

            var allBreaks = user.UserShifts.SelectMany(s => s.Breaks).ToList();

            return new AdminUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Login = user.Login,
                Role = user.Role.ToString(),
                TotalShifts = user.UserShifts.Count(),
                TotalBreaks = allBreaks.Count,
                CompletedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Finished),
                SkippedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Skipped)
            };
        }

        public async Task<UserShift> EndUserShiftAsync(int userShiftId)
        {
            var userShift = await _userShiftRepository.GetByIdAsync(userShiftId);
            if (userShift == null) throw new Exception($"Смена с ID {userShiftId} не найдена");
            if (userShift.EndedAt != null) throw new Exception("Смена уже завершена");

            var activeBreak = userShift.Breaks.FirstOrDefault(b => b.Status == BreakStatus.Taken);
            if (activeBreak != null)
            {
                // ИНКАПСУЛИРОВАННЫЙ ВЫЗОВ: Гарантирует освобождение слотов и уведомление очереди
                await _breakService.EndBreakAsync(activeBreak.Id, userShift.UserId);
            }

            userShift.EndedAt = DateTime.UtcNow;
            await _userShiftRepository.UpdateAsync(userShift);
            return userShift;
        }

        public async Task<AdminUserDto> CreateUser(CreateUserAdminDto request)
        {
            var existingUser = await _userRepository.GetByLoginAsync(request.Login);
            if (existingUser != null)
                throw new Exception($"Пользователь с логином {request.Login} уже существует");

            if (!Enum.TryParse<RoleType>(request.Role, true, out var role))
            {
                // Показываем доступные роли
                var validRoles = string.Join(", ", Enum.GetNames(typeof(RoleType)));
                throw new Exception($"Неверная роль '{request.Role}'. Доступные роли: {validRoles}");
            }

            var hashedPassword = _passwordHasher.Generate(request.Password);

            var user = new User
            {
                UserName = request.UserName,
                Login = request.Login,
                PasswordHash = hashedPassword,
                Role = role
            };

            await _userRepository.AddAsync(user);

            return new AdminUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Login = user.Login,
                Role = user.Role.ToString(),
                TotalShifts = 0,
                TotalBreaks = 0,
                CompletedBreaks = 0,
                SkippedBreaks = 0
            };
        }

        public async Task<AdminUserDto> UpdateUser(int userId, UpdateUserAdminDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"Пользователь с ID {userId} не найден");

            if (!string.IsNullOrWhiteSpace(request.UserName))
                user.UserName = request.UserName;

            if (!string.IsNullOrWhiteSpace(request.Login))
            {
                var existingUser = await _userRepository.GetByLoginAsync(request.Login);
                if (existingUser != null && existingUser.Id != userId)
                    throw new Exception($"Логин {request.Login} уже занят");
                user.Login = request.Login;
            }

            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                if (!Enum.TryParse<RoleType>(request.Role, true, out var role))
                {
                    var validRoles = string.Join(", ", Enum.GetNames(typeof(RoleType)));
                    throw new Exception($"Неверная роль '{request.Role}'. Доступные роли: {validRoles}");
                }
                user.Role = role;
            }

            if (!string.IsNullOrWhiteSpace(request.Password))
                user.PasswordHash = _passwordHasher.Generate(request.Password);

            await _userRepository.UpdateAsync(user);

            var shifts = await _userShiftRepository.GetByUserAsync(user.Id);
            var allBreaks = shifts.SelectMany(s => s.Breaks).ToList();

            return new AdminUserDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Login = user.Login,
                Role = user.Role.ToString(),
                TotalShifts = shifts.Count(),
                TotalBreaks = allBreaks.Count,
                CompletedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Finished),
                SkippedBreaks = allBreaks.Count(b => b.Status == BreakStatus.Skipped)
            };
        }

        public async Task DeleteUser(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new Exception($"Пользователь с ID {userId} не найден");

            await _userRepository.DeleteAsync(userId);
        }

        // ==================== СТАТИСТИКА ====================

        public async Task<DashboardStatsDto> GetDashboardStats()
        {
            var users = await _userRepository.GetAllAsync();
            var allShifts = await _userShiftRepository.GetAllAsync();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var todayShifts = allShifts.Where(s => s.WorkDate == today).ToList();
            var allBreaks = todayShifts.SelectMany(s => s.Breaks).ToList();
            var activeBreaks = allBreaks.Where(b => b.Status == BreakStatus.Taken).ToList();

            return new DashboardStatsDto
            {
                TotalUsers = users.Count(),
                TotalShiftsToday = todayShifts.Count,
                ActiveBreaks = activeBreaks.Count,
                CompletedBreaksToday = allBreaks.Count(b => b.Status == BreakStatus.Finished),
                SkippedBreaksToday = allBreaks.Count(b => b.Status == BreakStatus.Skipped),
                TotalBreaksToday = allBreaks.Count
            };
        }

        public async Task<List<UserShiftDetailDto>> GetTodayShifts()
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var shifts = await _userShiftRepository.GetByDateAsync(today);

            return shifts.Select(s => new UserShiftDetailDto
            {
                Id = s.Id,
                UserId = s.UserId,
                UserName = s.User.UserName,
                ScheduleName = s.Schedule.Name,
                WorkDate = s.WorkDate,
                Group = s.Group.ToString(),
                TotalBreaks = s.Breaks.Count,
                ActiveBreaks = s.Breaks.Count(b => b.Status == BreakStatus.Taken),
                CompletedBreaks = s.Breaks.Count(b => b.Status == BreakStatus.Finished),
                SkippedBreaks = s.Breaks.Count(b => b.Status == BreakStatus.Skipped)
            }).ToList();
        }

        // ==================== РАСПИСАНИЯ ====================

        public async Task<List<Schedule>> GetAllSchedules()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            return schedules.ToList();
        }

        public async Task<Schedule> GetScheduleById(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                throw new Exception($"Расписание с ID {id} не найдено");
            return schedule;
        }

        public async Task<Schedule> CreateSchedule(CreateScheduleDto request)
        {
            var schedule = new Schedule
            {
                Name = request.Name,
                StartTime = request.StartTime,
                EndTime = request.EndTime
            };

            return await _scheduleRepository.AddAsync(schedule);
        }

        public async Task<Schedule> UpdateSchedule(int id, UpdateScheduleDto request)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                throw new Exception($"Расписание с ID {id} не найдено");

            if (!string.IsNullOrWhiteSpace(request.Name))
                schedule.Name = request.Name;

            if (request.StartTime != null)
                schedule.StartTime = request.StartTime;

            if (request.EndTime != null)
                schedule.EndTime = request.EndTime;

            await _scheduleRepository.UpdateAsync(schedule);
            return schedule;
        }

        public async Task DeleteSchedule(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            if (schedule == null)
                throw new Exception($"Расписание с ID {id} не найдено");

            await _scheduleRepository.DeleteAsync(id);
        }

        // ==================== ПУЛЫ ПЕРЕРЫВОВ ====================

        public async Task<List<BreakPoolDayDto>> GetAllBreakPools()
        {
            var pools = await _breakPoolDayRepository.GetAllAsync();

            return pools.Select(p => new BreakPoolDayDto
            {
                Id = p.Id,
                Group = p.Group,
                WorkDate = p.WorkDate,
                MaxCurrentBreaks = p.TotalBreaks,
                CurrentBreaksCount = p.TotalBreaks - p.AvailableBreaks,
                AvailableBreaksCount = p.AvailableBreaks
            }).ToList();
        }

        public async Task<BreakPoolDayDto> GetBreakPoolByDateAndShift(DateOnly date, ShiftType shift)
        {
            var pool = await _breakPoolDayRepository.GetByDateAndShiftAsync(date, shift);

            if (pool == null)
                throw new Exception($"Пул перерывов не найден для даты {date} и смены {shift}");

            return new BreakPoolDayDto
            {
                Id = pool.Id,
                Group = pool.Group,
                WorkDate = pool.WorkDate,
                MaxCurrentBreaks = pool.TotalBreaks,
                CurrentBreaksCount = pool.TotalBreaks - pool.AvailableBreaks,
                AvailableBreaksCount = pool.AvailableBreaks
            };
        }

        public async Task<BreakPoolDayDto> CreateOrUpdateBreakPool(CreateBreakPoolDayDto request)
        {
            var existingPool = await _breakPoolDayRepository.GetByDateAndShiftAsync(
                request.WorkDate,
                request.Group);

            if (existingPool != null)
            {
                // Обновляем существующий
                existingPool.TotalBreaks = request.MaxCurrentBreaks;
                existingPool.AvailableBreaks = request.MaxCurrentBreaks;

                var updated = await _breakPoolDayRepository.UpdateAsync(existingPool);

                return new BreakPoolDayDto
                {
                    Id = updated.Id,
                    Group = updated.Group,
                    WorkDate = updated.WorkDate,
                    MaxCurrentBreaks = updated.TotalBreaks,
                    CurrentBreaksCount = updated.TotalBreaks - updated.AvailableBreaks,
                    AvailableBreaksCount = updated.AvailableBreaks
                };
            }
            else
            {
                // Создаем новый
                var newPool = new BreakPoolDay
                {
                    Group = request.Group,
                    WorkDate = request.WorkDate,
                    TotalBreaks = request.MaxCurrentBreaks,
                    AvailableBreaks = request.MaxCurrentBreaks
                };

                var created = await _breakPoolDayRepository.AddAsync(newPool);

                return new BreakPoolDayDto
                {
                    Id = created.Id,
                    Group = created.Group,
                    WorkDate = created.WorkDate,
                    MaxCurrentBreaks = created.TotalBreaks,
                    CurrentBreaksCount = 0,
                    AvailableBreaksCount = created.AvailableBreaks
                };
            }
        }
    }
}
