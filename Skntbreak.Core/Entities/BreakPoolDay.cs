using Skntbreak.Core.Enums;

public class BreakPoolDay
{
    public int Id { get; set; }
    public ShiftType Group { get; set; }
    public DateOnly WorkDate { get; set; }
    public int TotalBreaks { get; set; }       // макс одновременно
    public int AvailableBreaks { get; set; }   // сколько ещё можно

    // НОВОЕ: для графика 18-02 — лимиты по типам перерывов
    public int? Total10MinBreaks { get; set; }     // null = не 18-02
    public int? Remaining10MinBreaks { get; set; }
    public int? Total20MinBreaks { get; set; }
    public int? Remaining20MinBreaks { get; set; }
}