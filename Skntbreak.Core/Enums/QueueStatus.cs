// Skntbreak.Core/Enums/QueueStatus.cs
namespace Skntbreak.Core.Enums
{
    public enum QueueStatus
    {
        Waiting,        // В очереди, ждёт
        Notified,       // Получил уведомление "твоя очередь"
        Confirmed,      // Подтвердил — перерыв начался
        Postponed,      // Нажал "пока не могу" → сдвиг на +2
        Expired,        // Не ответил за 90 сек → в конец
        Cancelled       // Отменил
    }
}
