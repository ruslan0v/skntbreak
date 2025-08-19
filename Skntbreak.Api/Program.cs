using Microsoft.EntityFrameworkCore;
using Skntbreak.Application.Interfaces;
using Skntbreak.Core.Interfaces.Skntbreak.Application.Interfaces;
using Skntbreak.Core.Interfaces;
using Skntbreak.Infrastructure.Data.Repositories;
using SkntBreak.Infrastructure.Data;
using SkntBreak.Infrastructure.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;


builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<SkntbreakDbContext>(
    options =>
    {
        options.UseNpgsql(configuration.GetConnectionString(nameof(SkntbreakDbContext)));
    });

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBreakRepository, BreakRepository>();
builder.Services.AddScoped<IScheduleRepository, ScheduleRepository>();
builder.Services.AddScoped<IBreakRuleRepository, BreakRuleRepository>();
builder.Services.AddScoped<IBreakChatRepository, BreakChatRepository>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{   
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
