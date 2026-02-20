using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data;

namespace SkntBreak.Infrastructure.Data.Repositories
{
    public class ShiftBreakTemplateRepository : IShiftBreakTemplateRepository
    {
        private readonly SkntbreakDbContext _context;

        public ShiftBreakTemplateRepository(SkntbreakDbContext context)
        {
            _context = context;
        }

        public async Task<ShiftBreakTemplate?> GetByIdAsync(int id)
        {
            return await _context.ShiftBreakTemplates
                .Include(sbt => sbt.Schedule)
                .AsNoTracking()
                .FirstOrDefaultAsync(sbt => sbt.Id == id);
        }
        
        public async Task<IEnumerable<ShiftBreakTemplate>> GetAllAsync()
        {
            return await _context.ShiftBreakTemplates
                .Include(sbt => sbt.Schedule)
                .AsNoTracking()
                .OrderBy(sbt => sbt.ScheduleId)
                .ThenBy(sbt => sbt.Order)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<ShiftBreakTemplate>> GetByScheduleAsync(int scheduleId)
        {
            return await _context.ShiftBreakTemplates
                .Include(sbt => sbt.Schedule)
                .AsNoTracking()
                .Where(sbt => sbt.ScheduleId == scheduleId)
                .OrderBy(sbt => sbt.Order)
                .ToListAsync();
        }

        public async Task<ShiftBreakTemplate> AddAsync(ShiftBreakTemplate template)
        {
            if (template.ScheduleId <= 0)
                throw new ArgumentException("Поле с ScheduleId не может быть пустым");

            if (template.Order <= 0)
                throw new ArgumentException("Порядковый номер должен быть больше 0");

            // Проверяем, что нет дубликата по порядку в рамках расписания
            if (await _context.ShiftBreakTemplates.AnyAsync(sbt => sbt.ScheduleId == template.ScheduleId && sbt.Order == template.Order))
                throw new InvalidOperationException($"Шаблон перерыва с порядком '{template.Order}' для расписания с Id '{template.ScheduleId}' уже существует");

            await _context.ShiftBreakTemplates.AddAsync(template);
            await _context.SaveChangesAsync();

            return template;
        }

        public async Task UpdateAsync(ShiftBreakTemplate template)
        {
            var templateEntity = await _context.ShiftBreakTemplates.FindAsync(template.Id);
            if (templateEntity == null)
            {
                throw new InvalidOperationException($"Шаблон перерыва с Id - {template.Id} не найден");
            }

            // Проверяем дублирование по порядку если изменился порядок или расписание
            if (templateEntity.Order != template.Order || templateEntity.ScheduleId != template.ScheduleId)
            {
                if (await _context.ShiftBreakTemplates.AnyAsync(sbt => sbt.ScheduleId == template.ScheduleId && sbt.Order == template.Order && sbt.Id != template.Id))
                {
                    throw new InvalidOperationException($"Шаблон перерыва с порядком '{template.Order}' для расписания с Id '{template.ScheduleId}' уже существует");
                }
            }

            _context.ShiftBreakTemplates.Update(template);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var template = await _context.ShiftBreakTemplates
                .Include(sbt => sbt.Schedule)
                .FirstOrDefaultAsync(sbt => sbt.Id == id);

            if (template == null)
            {
                throw new InvalidOperationException($"Шаблон перерыва с данным Id - {id} не найден");
            }

            _context.ShiftBreakTemplates.Remove(template);
            await _context.SaveChangesAsync();
        }
    }
}
