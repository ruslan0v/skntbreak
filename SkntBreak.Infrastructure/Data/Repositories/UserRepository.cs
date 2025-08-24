using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;

namespace SkntBreak.Infrastructure.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly SkntbreakDbContext _context;

        public UserRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users
                .Include(u => u.Schedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
        }
        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(u => u.Schedule)
                .AsNoTracking()
                .OrderBy(u => u.UserName)
                .ToListAsync();
        }

        public async Task<User?> GetByLoginAsync(string login)
        {
            if (string.IsNullOrEmpty(login))
                throw new ArgumentException("Логин не может быть пустым");
            
            return await _context.Users
                .Include(u => u.Schedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Login == login);
        }

        public async Task<IEnumerable<User>> GetByScheduleAsync(int scheduleId)
        {
            return await _context.Users
                .Include(u => u.Schedule)
                .AsNoTracking()
                .Where(u => u.ScheduleId == scheduleId)
                .ToListAsync();
        }

        public async Task<User> AddAsync(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Login))
                throw new ArgumentException("Поле с логином не может быть пустым");

            if (await _context.Users.AnyAsync(u => u.Login == user.Login))
                throw new InvalidOperationException($"Пользователь с логином '{user.Login}' уже существует");

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public async Task UpdateAsync(User user)
        {
            var userEntity = await _context.Users.FindAsync(user.Id);
            if (userEntity == null)
            {
                throw new InvalidOperationException($"Пользователь с Id - {user.Id} не найден");
            }

            if (userEntity.Login != user.Login)
            {
                if (await _context.Users.AnyAsync(u => u.Login == user.Login && u.Id != user.Id))
                {
                    throw new InvalidOperationException($"Пользователь с логином '{user.Login}' уже существует");
                }
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _context.Users
                .Include(u => u.Breaks)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                throw new InvalidOperationException($"Пользователь с данным Id - {id} не найден");
            }

            var activeBreak = user.Breaks?.FirstOrDefault(b => b.Status == BreakStatus.Taken);
            if (activeBreak != null)
            {
                throw new InvalidOperationException($"Нельзя удалить пользователя с активным перерывом");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
