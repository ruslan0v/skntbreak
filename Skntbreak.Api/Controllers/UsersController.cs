using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Skntbreak.Application.Interfaces;
using Skntbreak.Application.Services;
using Skntbreak.Core.Dto.Users;
using Skntbreak.Core.Enums;
using Skntbreak.Core.Interfaces;
using SkntBreak.Infrastructure.Data.Repositories;

namespace Skntbreak.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Register(RegisterUserRequest request)
        {
            try
            {
                await _userService.Register(request.UserName, request.Login, request.Password);
                return Ok(new { message = "Пользователь успешно зарегистрирован" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginUserRequest request)
        {
            var token = await _userService.Login(request.Login, request.Password);

            Response.Cookies.Append("cookies", token);

            return Ok(new { token });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetCurrentUserId();
                var profile = await _userService.GetProfile(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto request)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _userService.UpdateProfile(userId, request);
                return Ok(new { message = "Профиль обновлён" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Необходима авторизация");
            }
            return userId;
        }
    }
 }
