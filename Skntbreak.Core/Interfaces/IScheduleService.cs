using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Entities;

namespace Skntbreak.Core.Interfaces
{
    public interface IScheduleService
    {
        Task<Schedule> CreateSchedule(CreateScheduleDto createScheduleDto);
        Task<List<Schedule>> GetAllSchedules();
        Task<Schedule> GetScheduleById(int id);
        Task<Schedule> DeleteSchedule(int id);
        Task<Schedule> UpdateSchedule(int id, UpdateScheduleDto updateScheduleDto);
    }
}
