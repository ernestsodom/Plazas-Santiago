import * as XLSX from "xlsx";
import type { DataType, ParsedExcel, ColumnType } from "@/types";

/**
 * Parse an Excel ArrayBuffer into headers + row objects.
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParsedExcel {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  });

  const headers =
    rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];

  return {
    headers,
    rows,
    rowCount: rows.length,
  };
}

/**
 * Parse an Excel File (browser) into ParsedExcel.
 */
export async function parseExcelFile(file: File): Promise<ParsedExcel> {
  const buffer = await file.arrayBuffer();
  return parseExcelBuffer(buffer);
}

const VENTAS_KEYWORDS = ["venta", "cliente", "producto", "factura", "ingreso"];
const FINANZAS_KEYWORDS = [
  "gasto",
  "costo",
  "saldo",
  "balance",
  "presupuesto",
  "monto",
  "pago",
];
const PROYECTOS_KEYWORDS = [
  "proyecto",
  "tarea",
  "avance",
  "porcentaje",
  "estado",
  "hito",
  "responsable",
];

/**
 * Heuristically detect the data type based on column names.
 */
export function detectDataType(headers: string[]): DataType {
  const normalized = headers.map((h) => h.toLowerCase());
  const score = { ventas: 0, finanzas: 0, proyectos: 0 };

  for (const h of normalized) {
    if (VENTAS_KEYWORDS.some((k) => h.includes(k))) score.ventas++;
    if (FINANZAS_KEYWORDS.some((k) => h.includes(k))) score.finanzas++;
    if (PROYECTOS_KEYWORDS.some((k) => h.includes(k))) score.proyectos++;
  }

  const matchedCategories = Object.values(score).filter((v) => v > 0).length;
  if (matchedCategories === 0) return "mixto";
  if (matchedCategories > 1) return "mixto";

  const max = Math.max(score.ventas, score.finanzas, score.proyectos);
  if (score.ventas === max) return "ventas";
  if (score.finanzas === max) return "finanzas";
  return "proyectos";
}

/**
 * Suggest a column type based on the column name.
 */
export function suggestColumnType(header: string): ColumnType {
  const h = header.toLowerCase();
  if (h.includes("fecha") || h.includes("date") || h.includes("dia"))
    return "fecha";
  if (
    h.includes("monto") ||
    h.includes("total") ||
    h.includes("precio") ||
    h.includes("importe") ||
    h.includes("valor")
  )
    return "monto";
  if (h.includes("categoria") || h.includes("tipo") || h.includes("rubro"))
    return "categoria";
  if (h.includes("descrip") || h.includes("detalle") || h.includes("nota"))
    return "descripcion";
  if (h.includes("estado") || h.includes("status")) return "estado";
  if (h.includes("porcentaje") || h.includes("avance") || h.includes("%"))
    return "porcentaje";
  if (h.includes("nombre") || h.includes("cliente") || h.includes("proyecto"))
    return "nombre";
  return "otro";
}
