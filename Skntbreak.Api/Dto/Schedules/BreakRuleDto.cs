using Skntbreak.Core.Enums;

namespace Skntbreak.Api.Dto.Schedules
{
    public class BreakRuleDto
    {
        public BreakType Type { get; set; }
        public int MaxCount { get; set; }
    }
}
