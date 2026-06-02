export type DataType = "ventas" | "finanzas" | "proyectos" | "mixto";

export type ColumnType =
  | "fecha"
  | "monto"
  | "categoria"
  | "descripcion"
  | "estado"
  | "porcentaje"
  | "nombre"
  | "otro";

export interface ColumnMapping {
  column: string;
  type: ColumnType;
}

export type ExcelRow = Record<string, unknown>;

export interface Report {
  id: string;
  name: string;
  file_name: string;
  file_size: number | null;
  data_type: DataType;
  row_count: number | null;
  columns: ColumnMapping[] | null;
  created_at: string;
}

export interface ReportData {
  id: string;
  report_id: string;
  row_data: Record<string, unknown>;
  row_index: number | null;
  created_at: string;
}

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface UploadPayload {
  name: string;
  fileName: string;
  fileSize: number;
  dataType: DataType;
  columns: ColumnMapping[];
  rows: Record<string, unknown>[];
}

export interface DashboardStats {
  totalRegistros: number;
  totalReportes: number;
  periodoCubierto: string;
  ultimoUpload: string | null;
}

export interface ChartPoint {
  label: string;
  value: number;
}
