using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Skntbreak.Core.Entities
{
    public class UserShift
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int ScheduleId { get; set; }
        public Schedule Schedule { get; set; }

        public DateOnly WorkDate { get; set; }

        public ICollection<Break> Breaks { get; set; } = new List<Break>();
    }
}
