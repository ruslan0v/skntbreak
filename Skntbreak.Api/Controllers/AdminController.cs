using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Application.Services;
using Skntbreak.Core.Dto.Admin;
using Skntbreak.Core.Dto.BreakPoolDay;
using Skntbreak.Core.Dto.Schedules;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = "AdminOnly")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // ==================== СТАТИСТИКА ====================

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStats();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("shifts/today")]
        public async Task<IActionResult> GetTodayShifts()
        {
            try
            {
                var shifts = await _adminService.GetTodayShifts();
                return Ok(shifts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ==================== ПОЛЬЗОВАТЕЛИ ====================

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            try
            {
                var user = await _adminService.GetUserById(id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserAdminDto request)
        {
            try
            {
                var user = await _adminService.CreateUser(request);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserAdminDto request)
        {
            try
            {
                var user = await _adminService.UpdateUser(id, request);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                await _adminService.DeleteUser(id);
                return Ok(new { message = "Пользователь удалён" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ==================== РАСПИСАНИЯ ====================

        [HttpGet("schedules")]
        public async Task<IActionResult> GetAllSchedules()
        {
            try
            {
                var schedules = await _adminService.GetAllSchedules();
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("schedules/{id}")]
        public async Task<IActionResult> GetSchedule(int id)
        {
            try
            {
                var schedule = await _adminService.GetScheduleById(id);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPost("schedules")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleDto request)
        {
            try
            {
                var schedule = await _adminService.CreateSchedule(request);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("schedules/{id}")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateScheduleDto request)
        {
            try
            {
                var schedule = await _adminService.UpdateSchedule(id, request);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("schedules/{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            try
            {
                await _adminService.DeleteSchedule(id);
                return Ok(new { message = "Расписание удалено" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ==================== ПУЛЫ ПЕРЕРЫВОВ ====================

        [HttpGet("break-pools")]
        public async Task<IActionResult> GetAllBreakPools()
        {
            try
            {
                var pools = await _adminService.GetAllBreakPools();
                return Ok(pools);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("break-pools/{date}/{shift}")]
        public async Task<IActionResult> GetBreakPool(string date, int shift)
        {
            try
            {
                var workDate = DateOnly.Parse(date);
                var shiftType = (ShiftType)shift;
                var pool = await _adminService.GetBreakPoolByDateAndShift(workDate, shiftType);
                return Ok(pool);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [HttpPost("break-pools")]
        public async Task<IActionResult> CreateOrUpdateBreakPool([FromBody] CreateBreakPoolDayDto request)
        {
            try
            {
                var pool = await _adminService.CreateOrUpdateBreakPool(request);
                return Ok(pool);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("shifts/{userShiftId}/end")]
        public async Task<IActionResult> EndUserShift(int userShiftId)
        {
            try
            {
                var userShift = await _adminService.EndUserShiftAsync(userShiftId);
                return Ok(new { message = "Смена завершена", endedAt = userShift.EndedAt });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

