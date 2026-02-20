using System;
using System.Collections.Generic;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class Schedule
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public ShiftType ShiftType { get; set; }
        public bool AllowDurationChoice { get; set; } = false; // true для 18-02

        // Navigation properties
        public ICollection<UserShift> UserShifts { get; set; } = new List<UserShift>();
        public ICollection<ShiftBreakTemplate> BreakTemplates { get; set; } = new List<ShiftBreakTemplate>();
    }
}
