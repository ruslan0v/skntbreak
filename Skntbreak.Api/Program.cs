using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Skntbreak.Api.Hubs;
using Skntbreak.Api.Services;
using Skntbreak.Application.Interfaces;
using Skntbreak.Application.Services;
using Skntbreak.Core.Interfaces;
using Skntbreak.Infrastructure.Data.Repositories;
using Skntbreak.Infrastructure.Helpers;
using SkntBreak.Infrastructure.Data;
using SkntBreak.Infrastructure.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.Configure<JwtOptions>(configuration.GetSection(nameof(JwtOptions)));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
   .AddJwtBearer(options =>
   {
       options.TokenValidationParameters = new TokenValidationParameters
       {
           ValidateIssuer = false,
           ValidateAudience = false,
           ValidateLifetime = true,
           ValidateIssuerSigningKey = true,
           IssuerSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(
        configuration.GetSection(nameof(JwtOptions))[nameof(JwtOptions.SecretKey)]!
    ))
       };

       options.Events = new JwtBearerEvents
       {
           OnMessageReceived = context =>
           {
               var accessToken = context.Request.Query["access_token"];
               var path = context.HttpContext.Request.Path;

               // Для WebSockets и SignalR извлекаем токен из query string
               if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/breakQueueHub"))
               {
                   context.Token = accessToken;
               }
               // Иначе сначала пытаемся прочитать токен из cookie
               else if (context.Request.Cookies.TryGetValue("cookies", out var tokenFromCookie))
               {
                   // Если в заголовке Authorization нет токена, используем токен из cookie
                   if (string.IsNullOrEmpty(context.Request.Headers["Authorization"]))
                   {
                       context.Token = tokenFromCookie;
                   }
               }
               return Task.CompletedTask;
           }
       };
   });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("TeamLeadOrAdmin", policy => policy.RequireRole("TeamLead", "Admin"));
    options.AddPolicy("RequireAuth", policy => policy.RequireAuthenticatedUser());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(setup =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "JWT Authentication",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Put **_ONLY_** your JWT Bearer token on textbox below!",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    setup.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);

    setup.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

builder.Services.AddSignalR();

builder.Services.AddDbContext<SkntbreakDbContext>(
    options =>
    {
        options.UseNpgsql(configuration.GetConnectionString(nameof(SkntbreakDbContext)));
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:7059")
             .AllowAnyMethod()
             .AllowAnyHeader()
             .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });


builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBreakRepository, BreakRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IBreakChatRepository, BreakChatRepository>();
builder.Services.AddScoped<IBreakPoolDayRepository, BreakPoolDayRepository>();
builder.Services.AddScoped<IUserShiftRepository, UserShiftRepository>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IBreakService, BreakService>();
builder.Services.AddScoped<IUserShiftService, UserShiftService>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IBreakQueueRepository, BreakQueueRepository>();
builder.Services.AddScoped<IBreakQueueService, BreakQueueService>();
builder.Services.AddHostedService<QueueNotificationWatcher>();
builder.Services.AddScoped<IBreakQueueNotifier, BreakQueueNotifier>();
builder.Services.AddScoped<IShiftBreakTemplateRepository, ShiftBreakTemplateRepository>();
builder.Services.AddHostedService<BreakAutoCloserService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseCookiePolicy(new CookiePolicyOptions
{
    MinimumSameSitePolicy = SameSiteMode.None,
    HttpOnly = HttpOnlyPolicy.Always,
    Secure = CookieSecurePolicy.SameAsRequest
});

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<BreakQueueHub>("/breakQueueHub");
app.MapControllers();

app.Run();