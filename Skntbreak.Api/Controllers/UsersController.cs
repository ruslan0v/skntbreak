using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : Controller 
    {
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
