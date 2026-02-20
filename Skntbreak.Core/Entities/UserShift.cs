using System;
using System.Collections.Generic;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class UserShift
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ScheduleId { get; set; }
        public DateOnly WorkDate { get; set; }
        public ShiftType Group { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public User User { get; set; } = null!;
        public Schedule Schedule { get; set; } = null!;
        public ICollection<Break> Breaks { get; set; } = new List<Break>();
        public ICollection<BreakQueue> QueueEntries { get; set; } = new List<BreakQueue>();
        public bool IsActive => EndedAt == null;
    }
}
