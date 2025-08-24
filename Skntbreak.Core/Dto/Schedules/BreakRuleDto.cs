using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Schedules
{
    public class BreakRuleDto
    {
        public BreakType Type { get; set; }
        public int DurationMinutes { get; set; }
    }
}
