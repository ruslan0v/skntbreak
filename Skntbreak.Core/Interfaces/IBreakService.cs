using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Dto.Break;


namespace Skntbreak.Core.Interfaces
{
    public interface IBreakService
    {
        Task<Break> StartBreak(StartBreakDto startBreakDto);
        Task<Break> EndBreak(EndBreakDto endBreakDto);
    }
}
