using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Core.Dto.Break;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BreaksController : ControllerBase
    {
        private readonly IBreakService _breakService;

        public BreaksController(IBreakService breakService)
        {
            _breakService = breakService;
        }

        // Взять перерыв
        [HttpPost("start")]
        public async Task<IActionResult> StartBreak([FromBody] StartBreakDto request)
        {
            var userId = GetCurrentUserId();
            try
            {
                var activeBreak = await _breakService.StartBreakAsync(request, userId);
                return Ok(activeBreak);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Завершить свой активный перерыв
        [HttpPost("end/{breakId}")]
        public async Task<IActionResult> EndBreak(int breakId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var endedBreak = await _breakService.EndBreakAsync(breakId, userId);
                return Ok(endedBreak);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // Пропустить перерыв
        [HttpPost("skip")]
        public async Task<IActionResult> SkipBreak([FromBody] SkipBreakDto request)
        {
            var userId = GetCurrentUserId();
            try
            {
                var skippedBreak = await _breakService.SkipBreakAsync(request, userId);
                return Ok(skippedBreak);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // НОВОЕ: Получить свой активный перерыв
        [HttpGet("my-active")]
        public async Task<IActionResult> GetMyActiveBreak()
        {
            try
            {
                var userId = GetCurrentUserId();
                var activeBreak = await _breakService.GetUserActiveBreakAsync(userId);

                if (activeBreak == null)
                    return Ok(new { hasActiveBreak = false });

                return Ok(new { hasActiveBreak = true, breakData = activeBreak });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // НОВОЕ: Получить все активные перерывы в моей смене
        [HttpGet("active-in-shift")]
        public async Task<IActionResult> GetActiveBreaksInMyShift([FromQuery] string date)
        {
            try
            {
                var userId = GetCurrentUserId();
                var workDate = DateOnly.Parse(date);

                var allActiveBreaks = await _breakService.GetActiveBreaksByDateAsync(workDate, userId);
                return Ok(allActiveBreaks);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // НОВОЕ: История перерывов пользователя
        [HttpGet("my-history")]
        public async Task<IActionResult> GetMyBreakHistory([FromQuery] string date)
        {
            try
            {
                var userId = GetCurrentUserId();
                var workDate = DateOnly.Parse(date);
                var history = await _breakService.GetUserBreakHistoryAsync(userId, workDate);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Пользователь не авторизован");
            return userId;
        }

        [HttpGet("pool-info")]
        public async Task<IActionResult> GetBreakPoolInfo([FromQuery] string date)
        {
            try
            {
                var userId = GetCurrentUserId();
                var workDate = DateOnly.Parse(date);

                var poolInfo = await _breakService.GetBreakPoolInfoAsync(workDate, userId);
                return Ok(poolInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
