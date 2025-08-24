using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.BreakPoolDay
{
    public class CreateBreakPoolDayDto
    {
        public ShiftType Group { get; set; }
        public DateOnly WorkDate { get; set; }
        public int MaxCurrentBreaks { get; set; }
    }
}
