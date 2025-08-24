using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.BreakChat
{
    public class UpdateBreakChatDto
    {
        public BreakType? Type { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public bool? IsReserved { get; set; }
    }
}
