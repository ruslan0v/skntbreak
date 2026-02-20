using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Users;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data.Repositories;

namespace Skntbreak.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IPasswordHasher _passwordHasher;
        private readonly IUserRepository _userRepository;
        private readonly IJwtProvider _jwtProvider;
        private readonly IUserShiftRepository _userShiftRepository;

        public UserService(
            IPasswordHasher passwordHasher,
            IUserRepository userRepository,
            IJwtProvider jwtProvider,
            IUserShiftRepository userShiftRepository)
        {
            _passwordHasher = passwordHasher;
            _userRepository = userRepository;
            _jwtProvider = jwtProvider;
            _userShiftRepository = userShiftRepository;
        }

        public async Task Register(string userName, string login, string password)
        {
            var hashedPassword = _passwordHasher.Generate(password);

            var user = new User
            {
                UserName = userName,
                Login = login,
                PasswordHash = hashedPassword
            };

            await _userRepository.AddAsync(user);
        }

        public async Task<string> Login(string login, string password)
        {
            var user = await _userRepository.GetByLoginAsync(login);

            if (user is null)
            {
                throw new Exception("Пользователь с таким логином не найден");
            }

            var result = _passwordHasher.Verify(password, user.PasswordHash);

            if (result == false)
            {
                throw new Exception("Неверный пароль");
            }

            var token = _jwtProvider.GenerateToken(user);

            return token;
        }

        public async Task<UserProfileDto> GetProfile(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                throw new Exception("Пользователь не найден");

            // Получаем статистику
            var shifts = await _userShiftRepository.GetByUserAsync(userId);
            var allBreaks = shifts.SelectMany(s => s.Breaks).ToList();

            return new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Login = user.Login,
                Role = user.Role.ToString(),
                TotalShifts = shifts.Count(),
                TotalBreaks = allBreaks.Count,
                CompletedBreaks = allBreaks.Count(b => b.Status == Core.Enums.BreakStatus.Finished),
                SkippedBreaks = allBreaks.Count(b => b.Status == Core.Enums.BreakStatus.Skipped)
            };
        }

        public async Task UpdateProfile(int userId, UpdateProfileDto request)
        {
            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null)
                throw new Exception("Пользователь не найден");

            if (!string.IsNullOrWhiteSpace(request.UserName))
                user.UserName = request.UserName;

            await _userRepository.UpdateAsync(user);
        }
    }
}
