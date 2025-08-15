namespace Skntbreak.Api.Dto.Schedules
{
    public class ScheduleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public List<BreakRuleDto> BreakRules { get; set; }
    }
}
