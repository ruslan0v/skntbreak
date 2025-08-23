using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class BreakRule
    {
        public int Id { get; set; }
        public BreakType Type { get; set; }
        public string AllowedDurations { get; set; } = "[]";
        public int MinIntervalMinutes {  get; set; }
        public int ScheduleId {  get; set; }
        public Schedule? Schedule {  get; set; }
    }
}
