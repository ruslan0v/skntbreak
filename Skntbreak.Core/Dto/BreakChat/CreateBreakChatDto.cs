using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.BreakChat
{
    public class CreateBreakChatDto
    {
        public int UserId { get; set; }
        public BreakType Type { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsReserved { get; set; }
    }
}
