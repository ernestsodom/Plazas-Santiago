# ExcelDash

Herramienta para subir archivos Excel y generar dashboards automáticos.

## Stack
- **ASP.NET Core 9 + Blazor Server**
- **SQLite** (base de datos local, sin instalación)
- **ClosedXML** para leer archivos Excel
- **Chart.js** para gráficos interactivos

## Requisitos
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

## Cómo ejecutar

```bash
cd ExcelDashboard
dotnet run
```

Luego abre tu navegador en `http://localhost:5000`

## Migrar a SQL Server (opcional)

1. Reemplaza el paquete `Microsoft.EntityFrameworkCore.Sqlite` por `Microsoft.EntityFrameworkCore.SqlServer`
2. Cambia en `Program.cs`:
```csharp
opt.UseSqlite("Data Source=dashboard.db")
// → 
opt.UseSqlServer("Server=...;Database=ExcelDash;...")
```

## Funcionalidades
- Subir archivos `.xlsx` / `.xls`
- Detección automática de columnas numéricas
- Gráficos de barras, línea, torta y dona
- KPIs automáticos (suma, promedio, máximo)
- Vista previa de datos en tabla
- Gestión de archivos (listar, eliminar)
