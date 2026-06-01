using Microsoft.EntityFrameworkCore;

namespace ExcelDashboard.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<ExcelFile> ExcelFiles => Set<ExcelFile>();
    public DbSet<ExcelRow> ExcelRows => Set<ExcelRow>();
}
