using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;

namespace Skntbreak.Application.Interfaces
{
    public interface IScheduleRepository
    {
        Task<Schedule?> GetByIdAsync(int id);
        Task<IEnumerable<Schedule>> GetAllAsync();
        Task<Schedule?> GetWithRulesAsync(int id);
        Task<Schedule?> GetWithUsersAsync(int id);

        Task<Schedule> AddAsync(Schedule schedule);
        Task UpdateAsync(Schedule schedule);
        Task DeleteAsync(int id);
    }
}

