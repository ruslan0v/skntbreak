namespace Skntbreak.Core.Dto.Users
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Login { get; set; }
        public string Role { get; set; }
        public int TotalShifts { get; set; }
        public int TotalBreaks { get; set; }
        public int CompletedBreaks { get; set; }
        public int SkippedBreaks { get; set; }
    }
}
