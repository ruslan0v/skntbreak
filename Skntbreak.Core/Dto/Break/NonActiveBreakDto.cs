using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Break
{
    public class NonActiveBreakDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int UserShiftId { get; set; }
        public BreakStatus Status { get; set; }
        public int DurationMinutes { get; set; }
        public int BreakNumber { get; set; }
        public DateTime EndTime { get; set; }
        public DateOnly WorkDate { get; set; }
    }
}