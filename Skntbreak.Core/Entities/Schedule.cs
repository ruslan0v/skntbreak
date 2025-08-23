using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Skntbreak.Core.Entities
{
    public class Schedule
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>;
        public ICollection<BreakRule> BreakRules { get; set; } = new List<BreakRule>;
    }
} 
