using ExcelDashboard.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite("Data Source=dashboard.db"));
builder.Services.AddScoped<ExcelService>();

var app = builder.Build();

// Auto-create DB
using (var scope = app.Services.CreateScope())
{
    var ctx = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    ctx.Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseAntiforgery();
app.MapRazorComponents<ExcelDashboard.Components.App>()
   .AddInteractiveServerRenderMode();

app.Run();
