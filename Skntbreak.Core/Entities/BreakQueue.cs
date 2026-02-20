// Skntbreak.Core/Entities/BreakQueue.cs
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class BreakQueue
    {
        public int Id { get; set; }

        // К какой дате+смене привязана очередь
        public DateOnly WorkDate { get; set; }
        public ShiftType Group { get; set; }

        // Какой номер перерыва (волна): 1, 2, 3...
        public int BreakRound { get; set; }

        // Позиция в очереди (1 = первый)
        public int Position { get; set; }

        // Пользователь
        public int UserShiftId { get; set; }
        public UserShift UserShift { get; set; } = null!;

        // Что выбрал (для 18-02: 10 или 20; для остальных — из шаблона)
        public int DurationMinutes { get; set; }

        // Статус в очереди
        public QueueStatus Status { get; set; } = QueueStatus.Waiting;

        // Когда встал в очередь
        public DateTime EnqueuedAt { get; set; }

        // Когда получил уведомление "твоя очередь"
        public DateTime? NotifiedAt { get; set; }

        // Приоритетный перерыв от тимлида
        public bool IsPriority { get; set; } = false;
    }
}
