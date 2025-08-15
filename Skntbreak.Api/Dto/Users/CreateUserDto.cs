using Skntbreak.Core.Enums;

namespace Skntbreak.Api.Dto.Users
{
    public class CreateUserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public RoleType Role { get; set; }
    }
}
