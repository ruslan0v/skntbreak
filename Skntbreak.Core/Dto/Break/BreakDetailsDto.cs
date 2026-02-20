using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class BreakDetailsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int UserShiftId { get; set; }
        public BreakStatus Status { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateOnly WorkDate { get; set; }
        public int BreakNumber { get; set; }
    }
}
