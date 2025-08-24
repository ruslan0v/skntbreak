using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class StartBreakDto
    {
        public int UserId { get; set; }
        public BreakType Type { get; set; }
        public DateTime StartTi { get; set; }
    }
}
