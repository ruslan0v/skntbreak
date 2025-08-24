using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class BreakStatisticsDto
    {
        public int TotalBreaks { get; set; }
        public int CompletedBreaks { get; set; }
        public int ActiveBreaks { get; set; }
        public int OverdueBreaks { get; set; }
        public TimeSpan TotalBreakTime { get; set; }
        public TimeSpan AverageBreakTime { get; set; }
        public Dictionary<BreakType, int> BreaksByType { get; set; } = new();
        public Dictionary<BreakStatus, int> BreaksByStatus { get; set; } = new();
        public DateOnly WorkDate { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
    }
}
