using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Enums;
namespace Skntbreak.Core.Dto.Queue
{
    public class QueuePositionDto
    {
        public int QueueEntryId { get; set; }
        public int Position { get; set; }
        public int BreakRound { get; set; }
        public int DurationMinutes { get; set; }
        public QueueStatus Status { get; set; }
        public int PeopleAhead { get; set; }
        public string? Message { get; set; }
    }
}

