using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Skntbreak.Core.Dto.Break
{
    public class SkipBreakDto
    {
        public DateTime RequestTime { get; set; } = DateTime.UtcNow;
        public int BreakNumber { get; set; }
        public int DurationMinutes { get; set; } = 20;
    }
}
