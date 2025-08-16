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
        public int UserId { get; set; }
        public User User { get; set; }

        public BreakStatus Status { get; set; }
        public BreakType Type { get; set; }
        public DateTime StartTime { get; set; }
    }
}
