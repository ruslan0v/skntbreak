namespace Skntbreak.Core.Dto.Admin
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalShiftsToday { get; set; }
        public int ActiveBreaks { get; set; }
        public int CompletedBreaksToday { get; set; }
        public int SkippedBreaksToday { get; set; }
        public int TotalBreaksToday { get; set; }
    }
}
