namespace Skntbreak.Core.Dto.Break
{
    public class BreakPoolInfoDto
    {
        public int TotalBreaks { get; set; }
        public int AvailableBreaks { get; set; }
        public int ActiveBreaks { get; set; }
        public bool CanTakeBreak { get; set; }
        public string? Message { get; set; }
    }
}
