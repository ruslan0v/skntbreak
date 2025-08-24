using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Schedules
{
    public class CreateBreakRuleDto
    {
        public BreakType Type { get; set; }
        public int DurationMinutes { get; set; }
    }
}
