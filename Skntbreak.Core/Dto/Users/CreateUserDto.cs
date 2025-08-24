using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.Users
{
    public class CreateUserDto
    {
        public string Name { get; set; }
        public RoleType Role { get; set; }
        public string ScheduleName { get; set; }
    }
}
