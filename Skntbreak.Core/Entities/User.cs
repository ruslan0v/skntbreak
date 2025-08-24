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

        public ICollection<UserShift> UserShifts { get; set; } = new List<UserShift>();
        public ICollection<BreakChat> BreakChats { get; set; } = new List<BreakChat>();
    }
}
