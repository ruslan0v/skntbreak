using Skntbreak.Core.Enums;
namespace Skntbreak.Core.Dto.Queue 
{
    public class QueueEntryDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Position { get; set; }
        public int DurationMinutes { get; set; }
        public QueueStatus Status { get; set; }
        public bool IsPriority { get; set; }
        public DateTime EnqueuedAt { get; set; }
        public DateTime? NotifiedAt { get; set; }
    }
}
