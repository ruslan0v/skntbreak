using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class BreakPoolDay
    {
        public int Id { get; set; }
        public ShiftType Group { get; set; }
        public DateOnly WorkDate {  get; set; }
        public int MaxCurrentBreaks { get; set; }
    }
}
