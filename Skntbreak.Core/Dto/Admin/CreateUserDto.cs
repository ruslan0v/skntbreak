namespace Skntbreak.Core.Dto.Admin
{
    public class CreateUserAdminDto
    {
        public string UserName { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Role { get; set; } // "SL1", "SL2", "Chatter", "TeamLead", "Admin"
    }
}
