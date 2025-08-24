using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces.Skntbreak.Application.Interfaces;
using SkntBreak.Infrastructure.Data;

namespace Skntbreak.Infrastructure.Data.Repositories
{
    public class BreakRuleRepository : IBreakRuleRepository
    {
        private readonly SkntbreakDbContext _context;

        public BreakRuleRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<ShiftBreakTemplate?> GetByIdAsync(int id)
        {
            return await _context.BreakRules
                .Include(br => br.Schedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(br => br.Id == id);
        }
        public async Task<IEnumerable<ShiftBreakTemplate>> GetAllAsync()
        {
            return await _context.BreakRules
                .AsNoTracking()
                .OrderBy(br => br.Type)
                .ToListAsync();
        }
        public async Task<IEnumerable<ShiftBreakTemplate>> GetByScheduleAsync(int scheduleId)
        {
            return await _context.BreakRules
                .Include(br => br.Schedule)
                .AsNoTracking()
                .Where(br => br.ScheduleId == scheduleId)
                .OrderBy(br => br.Id)
                .ToListAsync();
        }

        public async Task<ShiftBreakTemplate> AddAsync(ShiftBreakTemplate breakRule)
        {
            if (breakRule.ScheduleId <= 0)
                throw new ArgumentException("Поле с ScheduleId не может быть пустым");

            if (await _context.BreakRules.AnyAsync(br => br.ScheduleId == breakRule.ScheduleId && br.Type == breakRule.Type))
                throw new InvalidOperationException($"Правило перерыва типа '{breakRule.Type}' для расписания с Id '{breakRule.ScheduleId}' уже существует");

            await _context.BreakRules.AddAsync(breakRule);
            await _context.SaveChangesAsync();

            return breakRule;
        }

        public async Task UpdateAsync(ShiftBreakTemplate breakRule)
        {
            var breakRuleEntity = await _context.BreakRules.FindAsync(breakRule.Id);
            if (breakRuleEntity == null)
            {
                throw new InvalidOperationException($"Правило перерыва с Id - {breakRule.Id} не найдено");
            }

            if (breakRuleEntity.Type != breakRule.Type || breakRuleEntity.ScheduleId != breakRule.ScheduleId)
            {
                if (await _context.BreakRules.AnyAsync(br => br.ScheduleId == breakRule.ScheduleId && br.Type == breakRule.Type && br.Id != breakRule.Id))
                {
                    throw new InvalidOperationException($"Правило перерыва типа '{breakRule.Type}' для расписания с Id '{breakRule.ScheduleId}' уже существует");
                }
            }

            _context.BreakRules.Update(breakRule);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var breakRule = await _context.BreakRules
                .Include(br => br.Schedule)
                .FirstOrDefaultAsync(br => br.Id == id);

            if (breakRule == null)
            {
                throw new InvalidOperationException($"Правило перерыва с данным Id - {id} не найдено");
            }

            var activeBreaks = await _context.Breaks
                .Include(b => b.User)
                .AnyAsync(b => b.User.ScheduleId == breakRule.ScheduleId && b.Type == breakRule.Type && b.Status == BreakStatus.Taken);

            if (activeBreaks)
            {
                throw new InvalidOperationException($"Нельзя удалить правило перерыва, которое используется в активных перерывах");
            }

            _context.BreakRules.Remove(breakRule);
            await _context.SaveChangesAsync();
        }
        public async Task<ShiftBreakTemplate?> GetByTypeAndScheduleAsync(BreakType type, int scheduleId)
        {
            return await _context.BreakRules
                .AsNoTracking()
                .FirstOrDefaultAsync(br => br.Type == type && br.ScheduleId == scheduleId);
        }
    }
}
