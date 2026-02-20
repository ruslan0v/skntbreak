using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Application.Services
{
    public class ScheduleService : IScheduleService
    {
        private readonly IScheduleRepository _scheduleRepository;
        
        public ScheduleService(IScheduleRepository scheduleRepository)
        {
            _scheduleRepository = scheduleRepository;
        }

        public async Task<Schedule> CreateSchedule(CreateScheduleDto createScheduleDto)
        {
            Schedule schedule = new Schedule
            {
                Name = createScheduleDto.Name,
                StartTime = createScheduleDto.StartTime,
                EndTime = createScheduleDto.EndTime,
                ShiftType = createScheduleDto.ShiftType
            };

            var createdSchedule = await _scheduleRepository.AddAsync(schedule);
            return createdSchedule;
        }

        public async Task<List<Schedule>> GetAllSchedules()
        {
            var schedules = await _scheduleRepository.GetAllAsync();
            return schedules.ToList();
        }

        public async Task<Schedule> GetScheduleById(int id)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(id);
            return schedule;
        }

        public async Task<Schedule> DeleteSchedule(int id)
        {
           var schedule = await _scheduleRepository.GetByIdAsync(id);  
           await _scheduleRepository.DeleteAsync(id);
           return schedule;   
        }
        public async Task<Schedule> UpdateSchedule(int id, UpdateScheduleDto updateScheduleDto)
        {
            var scheduleEntity = await _scheduleRepository.GetByIdAsync(id);

            if (!string.IsNullOrWhiteSpace(updateScheduleDto.Name))
                scheduleEntity.Name = updateScheduleDto.Name;

            if (updateScheduleDto.StartTime != null)
                scheduleEntity.StartTime = updateScheduleDto.StartTime;

            if (updateScheduleDto.EndTime != null)
                scheduleEntity.EndTime = updateScheduleDto.EndTime;

            if (updateScheduleDto.ShiftType != null)
                scheduleEntity.ShiftType = updateScheduleDto.ShiftType;

            await _scheduleRepository.UpdateAsync(scheduleEntity);
            return scheduleEntity;
        }
    }
}
