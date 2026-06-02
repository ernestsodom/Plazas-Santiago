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

function isNumericValue(value: unknown): boolean {
  if (typeof value === "number") return !isNaN(value);
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]/g, "");
    return cleaned.length > 0 && !isNaN(toNumber(value));
  }
  return false;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  // Avoid treating plain numbers / short codes as dates.
  if (typeof value === "number") return null;
  const str = String(value);
  if (!/[-/.]|\d{4}/.test(str)) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function allKeys(rows: ReportData[]): string[] {
  return rows.length > 0 ? Object.keys(rows[0].row_data) : [];
}

/** Auto-detect the first column whose values mostly parse as dates. */
function detectDateColumn(rows: ReportData[]): string | null {
  const sample = rows.slice(0, 30);
  for (const key of allKeys(rows)) {
    const hits = sample.filter((r) => parseDate(r.row_data[key])).length;
    if (sample.length > 0 && hits / sample.length >= 0.6) return key;
  }
  return null;
}

/** Auto-detect the numeric column with the largest total magnitude. */
function detectNumericColumn(
  rows: ReportData[],
  exclude: (string | null)[] = []
): string | null {
  const sample = rows.slice(0, 30);
  let best: string | null = null;
  let bestScore = -1;
  for (const key of allKeys(rows)) {
    if (exclude.includes(key)) continue;
    const numeric = sample.filter((r) => isNumericValue(r.row_data[key]));
    if (sample.length === 0 || numeric.length / sample.length < 0.6) continue;
    const total = numeric.reduce(
      (acc, r) => acc + Math.abs(toNumber(r.row_data[key])),
      0
    );
    if (total > bestScore) {
      bestScore = total;
      best = key;
    }
  }
  return best;
}

/** Auto-detect a categorical (text, low-cardinality) column. */
function detectCategoryColumn(
  rows: ReportData[],
  exclude: (string | null)[] = []
): string | null {
  const sample = rows.slice(0, 50);
  let best: string | null = null;
  let bestDistinct = Infinity;
  for (const key of allKeys(rows)) {
    if (exclude.includes(key)) continue;
    const values = sample
      .map((r) => r.row_data[key])
      .filter((v) => v !== null && v !== undefined && v !== "");
    if (values.length === 0) continue;
    // Skip mostly-numeric columns.
    const numericRatio =
      values.filter((v) => isNumericValue(v)).length / values.length;
    if (numericRatio > 0.5) continue;
    const distinct = new Set(values.map((v) => String(v))).size;
    // Prefer columns with few distinct values (good for grouping).
    if (distinct > 1 && distinct <= 20 && distinct < bestDistinct) {
      bestDistinct = distinct;
      best = key;
    }
  }
  return best;
}

/** Aggregate monthly totals (or counts) across all report rows. */
export function buildMonthlyTrend(
  report: Report,
  rows: ReportData[]
): ChartPoint[] {
  const fechaCol =
    columnByType(report.columns, "fecha") ?? detectDateColumn(rows);
  if (!fechaCol) return [];

  const montoCol =
    columnByType(report.columns, "monto") ??
    detectNumericColumn(rows, [fechaCol]);

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
  const catCol =
    columnByType(report.columns, "categoria") ?? detectCategoryColumn(rows);
  if (!catCol) return [];

  const montoCol =
    columnByType(report.columns, "monto") ??
    detectNumericColumn(rows, [catCol]);

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
  const nombreCol =
    columnByType(report.columns, "nombre") ??
    detectCategoryColumn(rows) ??
    allKeys(rows)[0] ??
    null;
  const estadoCol = columnByType(report.columns, "estado");
  const pctCol =
    columnByType(report.columns, "porcentaje") ??
    detectNumericColumn(rows, [nombreCol]);

  return rows.slice(0, 10).map((r) => ({
    nombre: nombreCol ? String(r.row_data[nombreCol] ?? "—") : "—",
    estado: estadoCol ? String(r.row_data[estadoCol] ?? "") : "",
    porcentaje: pctCol
      ? Math.min(100, Math.max(0, toNumber(r.row_data[pctCol])))
      : 0,
  }));
}
