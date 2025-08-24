using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Application.Interfaces;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController()
        {

        }

        [HttpGet("GetUsers")]
        public IActionResult GetUsers()
        {
            return Ok("Hello World");
        }
    }
}
