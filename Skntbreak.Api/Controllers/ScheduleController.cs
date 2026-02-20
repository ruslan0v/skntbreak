using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers.Admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly IScheduleService _scheduleService;

        public ScheduleController(IScheduleService scheduleService)
        {
            _scheduleService = scheduleService;
        }

        // Доступно ВСЕМ авторизованным пользователям
        [Authorize]
        [HttpGet("getall")]
        public async Task<ActionResult<IEnumerable<Schedule>>> GetAllSchedules()
        {
            try
            {
                var result = await _scheduleService.GetAllSchedules();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Доступно ВСЕМ авторизованным пользователям
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Schedule>> GetSchedule([FromRoute] int id)
        {
            try
            {
                var result = await _scheduleService.GetScheduleById(id);
                if (result == null)
                {
                    return NotFound(new { error = $"Расписание с ID {id} не найдено" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Только TeamLead и Admin
        [Authorize(Policy = "TeamLeadOrAdmin")]
        [HttpPost("create")]
        public async Task<ActionResult<Schedule>> CreateSchedule([FromBody] CreateScheduleDto createScheduleDto)
        {
            try
            {
                var result = await _scheduleService.CreateSchedule(createScheduleDto);
                if (result == null)
                {
                    return BadRequest(new { error = "Не удалось создать расписание" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Только TeamLead и Admin
        [Authorize(Policy = "TeamLeadOrAdmin")]
        [HttpPut("update/{id}")]  // Исправлено: убран пробел
        public async Task<ActionResult<Schedule>> UpdateSchedule(int id, [FromBody] UpdateScheduleDto updateScheduleDto)
        {
            try
            {
                var result = await _scheduleService.UpdateSchedule(id, updateScheduleDto);
                if (result == null)
                {
                    return NotFound(new { error = $"Расписание с ID {id} не найдено" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Только TeamLead и Admin
        [Authorize(Policy = "TeamLeadOrAdmin")]
        [HttpDelete("{id}")]  // Исправлено: POST → DELETE
        public async Task<ActionResult> DeleteSchedule([FromRoute] int id)
        {
            try
            {
                var result = await _scheduleService.DeleteSchedule(id);
                if (result == null)
                {
                    return NotFound(new { error = $"Расписание с ID {id} не найдено" });
                }
                return Ok(new { message = "Расписание удалено" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
