using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class ActiveBreakDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int UserShiftId { get; set; }
        public BreakStatus Status { get; set; }
        public int DurationMinutes { get; set; }
        public int BreakNumber { get; set; }
        public DateTime StartTime { get; set; }
        public DateOnly WorkDate { get; set; }
        public string UserName { get; set; } = string.Empty; // ДОБАВЛЕНО

        // Вычисляемые свойства
        public DateTime ExpectedEndTime => StartTime.AddMinutes(DurationMinutes);
        public TimeSpan ElapsedTime => DateTime.UtcNow - StartTime;
        public TimeSpan RemainingTime
        {
            get
            {
                var remaining = ExpectedEndTime - DateTime.UtcNow;
                return remaining.TotalSeconds > 0 ? remaining : TimeSpan.Zero;
            }
        }
        public bool IsOverdue => DateTime.UtcNow > ExpectedEndTime;
    }
}
