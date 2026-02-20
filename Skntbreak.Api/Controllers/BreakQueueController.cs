using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Core.Dto.Queue;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BreakQueueController : ControllerBase
    {
        private readonly IBreakQueueService _queueService;

        public BreakQueueController(IBreakQueueService queueService)
        {
            _queueService = queueService;
        }

        [HttpPost("enqueue")]
        public async Task<IActionResult> Enqueue([FromBody] EnqueueRequestDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _queueService.EnqueueAsync(userId, request.DurationMinutes);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("state")]
        public async Task<IActionResult> GetState()
        {
            try
            {
                var userId = GetCurrentUserId();
                var state = await _queueService.GetQueueStateAsync(userId);
                return Ok(state);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("confirm/{queueEntryId}")]
        public async Task<IActionResult> Confirm(int queueEntryId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _queueService.ConfirmBreakAsync(userId, queueEntryId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        [HttpPost("postpone/{queueEntryId}")]
        public async Task<IActionResult> Postpone(int queueEntryId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _queueService.PostponeAsync(userId, queueEntryId);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("skip-round")]
        public async Task<IActionResult> SkipRound()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _queueService.SkipBreakRoundAsync(userId);
                return Ok(new { message = "Перерыв пропущен" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("priority/{targetUserId}")]
        [Authorize(Policy = "TeamLeadOrAdmin")]
        public async Task<IActionResult> PriorityBreak(
            int targetUserId,
            [FromBody] EnqueueRequestDto? request = null)
        {
            try
            {
                var requestingUserId = GetCurrentUserId();
                var result = await _queueService.EnqueuePriorityAsync(
                    targetUserId, requestingUserId, request?.DurationMinutes);
                return Ok(result);
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
    }
}