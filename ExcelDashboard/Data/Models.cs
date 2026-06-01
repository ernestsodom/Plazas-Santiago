using System.ComponentModel.DataAnnotations;

namespace ExcelDashboard.Data;

public class ExcelFile
{
    public int Id { get; set; }
    [MaxLength(300)]
    public string FileName { get; set; } = "";
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public int RowCount { get; set; }
    // JSON array of column names
    public string ColumnsJson { get; set; } = "[]";
    public List<ExcelRow> Rows { get; set; } = [];
}

public class ExcelRow
{
    public int Id { get; set; }
    public int ExcelFileId { get; set; }
    public ExcelFile? ExcelFile { get; set; }
    public int RowIndex { get; set; }
    // JSON object {"col1": "val1", ...}
    public string DataJson { get; set; } = "{}";
}
