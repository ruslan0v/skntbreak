using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Login { get; set; } = null!;
        public string PasswordHash { get; set; } = string.Empty;
        public RoleType Role { get; set; }
        public int? ScheduleId {  get; set; }
        public Schedule? Schedule { get; set; }

        public ICollection<Break> Breaks { get; set; } = new List<Break>();
        public ICollection<BreakChat> BreakChats { get; set; } = new List<BreakChat>();

    }
}
