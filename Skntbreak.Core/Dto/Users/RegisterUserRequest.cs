using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Users
{
    public class RegisterUserRequest
    {
        public string UserName { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
    }
}
