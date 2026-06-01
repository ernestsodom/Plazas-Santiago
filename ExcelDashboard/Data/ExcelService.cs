using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ExcelDashboard.Data;

public class ExcelService(AppDbContext db)
{
    public async Task<ExcelFile> ImportAsync(string fileName, Stream stream)
    {
        var workbook = new XLWorkbook(stream);
        var ws = workbook.Worksheet(1);
        var usedRange = ws.RangeUsed();
        if (usedRange == null) throw new InvalidOperationException("La hoja está vacía.");

        var firstRow = usedRange.FirstRow();
        var columns = firstRow.Cells().Select(c => c.GetString().Trim()).Where(h => h != "").ToList();

        var file = new ExcelFile
        {
            FileName = fileName,
            ColumnsJson = JsonSerializer.Serialize(columns)
        };

        var rows = new List<ExcelRow>();
        foreach (var row in usedRange.RowsUsed().Skip(1))
        {
            var dict = new Dictionary<string, string>();
            for (int i = 0; i < columns.Count; i++)
            {
                var cell = row.Cell(i + 1);
                dict[columns[i]] = cell.GetString();
            }
            rows.Add(new ExcelRow
            {
                RowIndex = row.RowNumber() - 1,
                DataJson = JsonSerializer.Serialize(dict)
            });
        }

        file.RowCount = rows.Count;
        file.Rows = rows;
        db.ExcelFiles.Add(file);
        await db.SaveChangesAsync();
        return file;
    }

    public async Task<List<ExcelFile>> GetFilesAsync() =>
        await db.ExcelFiles.OrderByDescending(f => f.UploadedAt).ToListAsync();

    public async Task<ExcelFile?> GetFileAsync(int id) =>
        await db.ExcelFiles.Include(f => f.Rows).FirstOrDefaultAsync(f => f.Id == id);

    public async Task DeleteFileAsync(int id)
    {
        var file = await db.ExcelFiles.Include(f => f.Rows).FirstOrDefaultAsync(f => f.Id == id);
        if (file != null) { db.ExcelFiles.Remove(file); await db.SaveChangesAsync(); }
    }

    // Returns aggregated data for a numeric column grouped by a label column
    public async Task<ChartData> GetChartDataAsync(int fileId, string labelCol, string valueCol, string aggregation = "sum")
    {
        var file = await GetFileAsync(fileId);
        if (file == null) return new ChartData();

        var groups = new Dictionary<string, List<double>>();
        foreach (var row in file.Rows)
        {
            var dict = JsonSerializer.Deserialize<Dictionary<string, string>>(row.DataJson) ?? [];
            var label = dict.TryGetValue(labelCol, out var l) ? l : "?";
            if (!double.TryParse(dict.TryGetValue(valueCol, out var v) ? v : "0",
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture, out var num)) num = 0;
            if (!groups.ContainsKey(label)) groups[label] = [];
            groups[label].Add(num);
        }

        var labels = groups.Keys.ToList();
        var values = groups.Values.Select(g => aggregation == "avg" ? g.Average() :
                                               aggregation == "count" ? g.Count :
                                               g.Sum()).ToList();

        return new ChartData { Labels = labels, Values = values };
    }
}

public record ChartData
{
    public List<string> Labels { get; init; } = [];
    public List<double> Values { get; init; } = [];
}
