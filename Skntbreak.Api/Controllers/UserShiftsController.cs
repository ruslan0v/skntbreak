using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Core.Dto.UserShift;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserShiftsController : ControllerBase
    {
        private readonly IUserShiftService _shiftService;

        public UserShiftsController(IUserShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartShift([FromBody] StartShiftRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var userShift = await _shiftService.StartShiftAsync(
                    userId,
                    request.ScheduleId
                );

                // Возвращаем DTO вместо entity
                var result = new
                {
                    userShift.Id,
                    userShift.UserId,
                    userShift.ScheduleId,
                    userShift.WorkDate,
                    userShift.Group,
                    userShift.StartedAt,
                    Schedule = userShift.Schedule == null ? null : new
                    {
                        userShift.Schedule.Id,
                        userShift.Schedule.Name,
                        userShift.Schedule.StartTime,
                        userShift.Schedule.EndTime,
                        userShift.Schedule.ShiftType
                    },
                    Breaks = userShift.Breaks?.Select(b => new
                    {
                        b.Id,
                        b.Status,
                        b.DurationMinutes,
                        b.BreakNumber,
                        b.StartTime,
                        b.EndTime
                    }).ToList()
                };

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                Console.WriteLine($"[StartShift] UnauthorizedAccessException: {ex.Message}");
                return Unauthorized(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"[StartShift] ArgumentException: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"[StartShift] InvalidOperationException: {ex.Message}");
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[StartShift] Exception: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }



        [HttpGet("my/{workDate}")]
        public async Task<IActionResult> GetMyShift(DateOnly workDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userShift = await _shiftService.GetUserShiftAsync(userId, workDate);

                if (userShift == null)
                    return NotFound(new { error = "Смена не найдена" });

                // Преобразуем в DTO
                var result = new
                {
                    userShift.Id,
                    userShift.UserId,
                    userShift.ScheduleId,
                    userShift.WorkDate,
                    userShift.Group,
                    Schedule = userShift.Schedule == null ? null : new
                    {
                        userShift.Schedule.Id,
                        userShift.Schedule.Name,
                        userShift.Schedule.StartTime,
                        userShift.Schedule.EndTime
                    },
                    Breaks = userShift.Breaks?.Select(b => new
                    {
                        b.Id,
                        b.Status,
                        b.DurationMinutes,
                        b.BreakNumber,
                        b.StartTime,
                        b.EndTime
                    }).ToList()
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetMyShift] Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyShifts()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userShifts = await _shiftService.GetUserShiftsAsync(userId);

                // Преобразуем в DTO
                var result = userShifts.Select(us => new
                {
                    us.Id,
                    us.UserId,
                    us.ScheduleId,
                    us.WorkDate,
                    us.Group,
                    Schedule = us.Schedule == null ? null : new
                    {
                        us.Schedule.Id,
                        us.Schedule.Name,
                        us.Schedule.StartTime,
                        us.Schedule.EndTime
                    },
                    Breaks = us.Breaks?.Select(b => new
                    {
                        b.Id,
                        b.Status,
                        b.DurationMinutes,
                        b.BreakNumber,
                        b.StartTime,
                        b.EndTime
                    }).ToList()
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetMyShifts] Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }



        [HttpDelete("{userShiftId}")]
        public async Task<IActionResult> DeleteShift(int userShiftId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _shiftService.DeleteUserShiftAsync(userShiftId, userId);
                return Ok(new { message = "Смена удалена" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("by-date-group/{workDate}/{group}")]
        public async Task<IActionResult> GetShiftsByDateAndGroup(DateOnly workDate, ShiftType group)
        {
            try
            {
                var shifts = await _shiftService.GetShiftsByDateAndGroupAsync(workDate, group);
                return Ok(shifts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("colleagues")]
        public async Task<IActionResult> GetColleagues([FromQuery] int scheduleId, [FromQuery] DateOnly workDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                var colleagues = await _shiftService.GetColleaguesAsync(scheduleId, workDate, userId);

                return Ok(colleagues);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GetColleagues] Error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("end")]
        public async Task<IActionResult> EndShift()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userShift = await _shiftService.EndShiftAsync(userId);

                return Ok(new
                {
                    message = "Смена завершена",
                    endedAt = userShift.EndedAt,
                    duration = userShift.EndedAt.Value - userShift.StartedAt
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("available")]  // ← ДО [HttpGet("my/{workDate}")]
        public async Task<IActionResult> GetAvailableSchedules()
        {
            try
            {
                var schedules = await _shiftService.GetAvailableSchedulesAsync();
                var result = schedules.Select(s => new
                {
                    id = s.Id,
                    name = s.Name,
                    startTime = s.StartTime.ToString(@"hh\:mm"),
                    endTime = s.EndTime.ToString(@"hh\:mm"),
                    shiftType = s.ShiftType
                });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            Console.WriteLine($"[GetCurrentUserId] Checking claims...");
            Console.WriteLine($"[GetCurrentUserId] User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");

            var userIdClaim = User.FindFirst("userId")?.Value;

            Console.WriteLine($"[GetCurrentUserId] userId claim: {userIdClaim}");

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                Console.WriteLine($"[GetCurrentUserId] ❌ Failed to parse userId");
                throw new UnauthorizedAccessException("Пользователь не авторизован");
            }

            Console.WriteLine($"[GetCurrentUserId] ✅ UserId parsed: {userId}");
            return userId;
        }
    }
}
