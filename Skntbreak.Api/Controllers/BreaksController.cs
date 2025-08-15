using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BreaksController : ControllerBase
    {
        private static readonly List<BreakDto> ActiveBreaks = new List<BreakDto>();
        private static int _idCounter = 1;

        public class BreakDto
        {
            public int Id { get; set; }
            public int UserId { get; set; }
            public string UserName { get; set; }
            public string LengthType { get; set; } // "10min" или "20min"
            public DateTime StartTime { get; set; }
            public DateTime? EndTime { get; set; }
        }

        // POST /api/breaks/start
        [HttpPost("start")]
        public IActionResult StartBreak(int userId, string userName, string lengthType)
        {
            var newBreak = new BreakDto
            {
                Id = _idCounter++,
                UserId = userId,
                UserName = userName,
                LengthType = lengthType,
                StartTime = DateTime.UtcNow
            };

            ActiveBreaks.Add(newBreak);
            return Ok(newBreak);
        }

        // POST /api/breaks/end
        [HttpPost("end")]
        public IActionResult EndBreak(int breakId)
        {
            var br = ActiveBreaks.FirstOrDefault(b => b.Id == breakId);
            if (br == null)
                return NotFound("Break not found");

            br.EndTime = DateTime.UtcNow;
            ActiveBreaks.Remove(br);

            return Ok(br);
        }

        // GET /api/breaks/active
        [HttpGet("active")]
        public IActionResult GetActiveBreaks()
        {
            return Ok(ActiveBreaks);
        }
    }
}
