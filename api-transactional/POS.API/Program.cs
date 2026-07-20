using Microsoft.EntityFrameworkCore;
using POS.Core.Interfaces;
using POS.Infrastructure.Data;
using POS.Infrastructure.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpContextAccessor();

// Register Tenant Accesor
builder.Services.AddScoped<ITenantContextAccessor, TenantContextAccessor>();

// Register Interceptor
builder.Services.AddScoped<TenantSaveChangesInterceptor>();

// Setup DB Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContextFactory<POSDbContext>((sp, options) =>
{
    options.UseSqlServer(connectionString);
});

// Setup custom DbContextFactory
builder.Services.AddScoped<IDbContextFactory, DbContextFactory>();

// Setup Redis
var redisConnString = builder.Configuration.GetValue<string>("Redis:ConnectionString") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => ConnectionMultiplexer.Connect(redisConnString));
builder.Services.AddSingleton<IRedisBus, RedisBus>();

// Setup MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(POS.Application.Orders.Commands.ProcessSecureCheckoutCommand).Assembly));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();

