using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class Break
    {
        public int Id { get; set; }

        public int UserShiftId { get; set; }
        public UserShift UserShift { get; set; }

        public BreakStatus Status { get; set; }
        public int DurationMinutes { get; set; }
        public int BreakNumber { get; set; }       // 1-й, 2-й и т.д.
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public DateOnly WorkDate { get; set; }
    }
}


