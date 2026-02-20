using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class BreakChat
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int BreakNumber { get; set; }
        public DateTime StartTime {  get; set; }
        public DateTime EndTime { get; set; }
        public bool IsReserved { get; set; }
    }
}
