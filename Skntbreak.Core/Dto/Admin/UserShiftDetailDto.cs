using System;

namespace Skntbreak.Core.Dto.Admin
{
    public class UserShiftDetailDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string ScheduleName { get; set; }
        public DateOnly WorkDate { get; set; }
        public string Group { get; set; }
        public int TotalBreaks { get; set; }
        public int ActiveBreaks { get; set; }
        public int CompletedBreaks { get; set; }
        public int SkippedBreaks { get; set; }
    }
}
