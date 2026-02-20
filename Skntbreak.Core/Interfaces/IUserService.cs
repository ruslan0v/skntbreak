using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Skntbreak.Core.Dto.Users;

namespace Skntbreak.Core.Interfaces
{
    public interface IUserService
    {
        public Task Register(string userName, string login, string password);
        public Task<string> Login(string login, string password);
        public Task<UserProfileDto> GetProfile(int userId);
        public Task UpdateProfile(int userId, UpdateProfileDto request);
    }
}
