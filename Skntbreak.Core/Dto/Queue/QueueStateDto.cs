namespace Skntbreak.Core.Dto.Queue
{
    public class QueueStateDto
    {
        public int CurrentRound { get; set; }
        public bool IsRoundComplete { get; set; }
        public List<QueueEntryDto> Queue { get; set; } = new();
        public int AvailableSlots { get; set; }
        public int ActiveBreaks { get; set; }

        // Для 18-02
        public bool AllowDurationChoice { get; set; }
        public int? Remaining10Min { get; set; }
        public int? Remaining20Min { get; set; }
        public QueueEntryDto? MyEntry { get; set; }
    }
}
