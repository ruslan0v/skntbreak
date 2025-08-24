using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Dto.Break;
using Skntbreak.Core.Entities;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;

namespace Skntbreak.Application.Services
{
    public class BreakService : IBreakService
    {
        private readonly IBreakRepository _breakRepository;
        private readonly IUserRepository _userRepository;
        public BreakService(IBreakRepository breakRepository, IUserRepository userRepository)
        {
            _breakRepository = breakRepository;
            _userRepository = userRepository;
        }

        public async Task<Break> StartBreak(StartBreakDto startBreakDto)
        {
            var newBreak = new Break
            {
                UserId = startBreakDto.UserId,
                Type = startBreakDto.Type,
                Status = BreakStatus.Taken,
                StartTime = DateTime.UtcNow,
                WorkDate = DateTime.Today,
                Du
            }
        }

        
    }
}
