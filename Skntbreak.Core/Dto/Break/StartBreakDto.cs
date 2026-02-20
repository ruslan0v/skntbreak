using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class StartBreakDto
    {
        public DateTime RequestTime { get; set; } = DateTime.UtcNow;
        public int BreakNumber { get; set; }
        public int DurationMinutes { get; set; } = 20;
    }
}
