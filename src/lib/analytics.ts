import type {
  ColumnMapping,
  ChartPoint,
  Report,
  ReportData,
} from "@/types";
import type { ProjectRow } from "@/components/dashboard/ProjectsTable";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function columnByType(
  columns: ColumnMapping[] | null,
  type: string
): string | null {
  if (!columns) return null;
  const match = columns.find((c) => c.type === type);
  return match ? match.column : null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/\.(?=\d{3})/g, "");
    const normalized = cleaned.replace(",", ".");
    const n = parseFloat(normalized);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? null : d;
}

/** Aggregate monthly totals (or counts) across all report rows. */
export function buildMonthlyTrend(
  report: Report,
  rows: ReportData[]
): ChartPoint[] {
  const fechaCol = columnByType(report.columns, "fecha");
  const montoCol = columnByType(report.columns, "monto");
  if (!fechaCol) return [];

  const buckets = new Map<string, number>();
  for (const r of rows) {
    const d = parseDate(r.row_data[fechaCol]);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const value = montoCol ? toNumber(r.row_data[montoCol]) : 1;
    buckets.set(key, (buckets.get(key) ?? 0) + value);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => {
      const [year, month] = key.split("-");
      return { label: `${MONTHS[Number(month)]} ${year.slice(2)}`, value };
    });
}

/** Aggregate totals by category. */
export function buildCategoryBreakdown(
  report: Report,
  rows: ReportData[]
): ChartPoint[] {
  const catCol = columnByType(report.columns, "categoria");
  const montoCol = columnByType(report.columns, "monto");
  if (!catCol) return [];

  const buckets = new Map<string, number>();
  for (const r of rows) {
    const cat = String(r.row_data[catCol] ?? "Sin categoría");
    const value = montoCol ? toNumber(r.row_data[montoCol]) : 1;
    buckets.set(cat, (buckets.get(cat) ?? 0) + value);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

/** Build project rows for the KPI table. */
export function buildProjectRows(
  report: Report,
  rows: ReportData[]
): ProjectRow[] {
  const nombreCol = columnByType(report.columns, "nombre");
  const estadoCol = columnByType(report.columns, "estado");
  const pctCol = columnByType(report.columns, "porcentaje");

  return rows.slice(0, 10).map((r) => ({
    nombre: nombreCol ? String(r.row_data[nombreCol] ?? "—") : "—",
    estado: estadoCol ? String(r.row_data[estadoCol] ?? "") : "",
    porcentaje: pctCol ? Math.min(100, Math.max(0, toNumber(r.row_data[pctCol]))) : 0,
  }));
}
