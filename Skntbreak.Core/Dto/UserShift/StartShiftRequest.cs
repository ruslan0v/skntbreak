using System;
using Skntbreak.Core.Enums;

namespace Skntbreak.Core.Dto.UserShift
{
    public class StartShiftRequest
    {
        public int UserId { get; set; }
        public int ScheduleId { get; set; }
    }
}
