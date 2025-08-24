using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class BreakDetailsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserEmail { get; set; }
        public BreakStatus Status { get; set; }
        public BreakType Type { get; set; }
        public int DurationMinutes { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateOnly WorkDate { get; set; }
        public TimeSpan? ActualDuration => EndTime.HasValue ? EndTime.Value - StartTime : null;
        public bool IsActive => Status == BreakStatus.Taken;
        public bool IsCompleted => Status == BreakStatus.Finished;
    }
}
