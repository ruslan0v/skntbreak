using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Schedules
{
    public class CreateScheduleDto
    {
        public string Name { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public List<CreateBreakRuleDto> BreakRules { get; set; } = new();
    }
}
