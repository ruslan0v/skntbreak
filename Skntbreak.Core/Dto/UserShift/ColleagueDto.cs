namespace Skntbreak.Core.Dto.UserShift
{
    public class ColleagueDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Group { get; set; } = string.Empty;
        public bool IsCurrentUser { get; set; }
        public int ActiveBreaksCount { get; set; }
        public int CompletedBreaksCount { get; set; }
    }
}
