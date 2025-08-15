using Skntbreak.Core.Enums;

namespace Skntbreak.Api.Dto.Break
{
    public class ActiveBreakDto
    {
        public int Id {  get; set; }
        public int UserId { get; set; }
        public string UserName {  get; set; }
        public BreakType Type { get; set; }
        public BreakStatus Status { get; set; }
        public DateTime StartTime { get; set; }
    }
}
