using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [Authorize(Policy = "TeamLeadOrAdmin")]
    [ApiController]
    public class PoolsController : ControllerBase
    {
        private readonly IBreakPoolDayRepository _poolRepository;
        
        public PoolsController(IBreakPoolDayRepository poolRepository)
        {
            _poolRepository = poolRepository;
        }

        [HttpPost("seed")]
        public async Task<IActionResult> Seed([FromQuery] DateOnly? date = null, [FromQuery] int breaks = 2)
        {
            var d = date ?? DateOnly.FromDateTime(DateTime.UtcNow.Date);

            async Task EnsureAsync(ShiftType shift, int total)
            {
                var exist = await _poolRepository.GetByDateAndShiftAsync(d, shift);
                if (exist == null)
                    await _poolRepository.AddAsync(new BreakPoolDay { Group = shift, WorkDate = d, TotalBreaks = total, AvailableBreaks = total });
            }

            await EnsureAsync(ShiftType.Day, breaks);
            await EnsureAsync(ShiftType.Evening, breaks);

            return Ok(new { date = d, breaks });
        }
    }
}
