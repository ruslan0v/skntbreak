using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.BreakChat
{
    public class BreakChatDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsReserved { get; set; }
        public TimeSpan Duration => EndTime - StartTime;
    }
}
