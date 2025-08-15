using Skntbreak.Core.Enums;

namespace Skntbreak.Api.Dto.Break
{
    public class StartBreakDto
    {
        public int UserId { get; set; }
        public BreakType Type {  get; set; }
    }
}
