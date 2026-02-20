using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Users
{
    public class UserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public RoleType Role { get; set; }
    }
}
