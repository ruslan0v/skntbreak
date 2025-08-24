using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.BreakPoolDay
{
    public class BreakPoolDayDto
    {
        public int Id { get; set; }
        public ShiftType Group { get; set; }
        public DateOnly WorkDate { get; set; }
        public int MaxCurrentBreaks { get; set; }
        public int CurrentBreaksCount { get; set; }
        public int AvailableBreaksCount { get; set; }
    }
}
