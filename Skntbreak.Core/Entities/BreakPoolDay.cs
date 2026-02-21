using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class BreakPoolDay
    {
        public int Id { get; set; }
        public ShiftType Group { get; set; }
        public DateOnly WorkDate { get; set; }
        public int TotalBreaks { get; set; }
        public int AvailableBreaks { get; set; }
        public int? Total10MinBreaks { get; set; }
        public int? Remaining10MinBreaks { get; set; }
        public int? Total20MinBreaks { get; set; }
        public int? Remaining20MinBreaks { get; set; }
        public uint Version { get; set; } // Для xmin Concurrency Token
    }
}