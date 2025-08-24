using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class ShiftBreakTemplate
    {
        public int Id { get; set; }
        public int ScheduleId { get; set; }
        public Schedule? Schedule { get; set; }

        public int Order {  get; set; } // (1,2,3) - порядковый номер
        public int DurationMinutes { get; set; } // 10 чи 20
    }
}
