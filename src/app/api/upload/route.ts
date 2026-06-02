import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase";
import { detectDataType, suggestColumnType } from "@/lib/excel-parser";
import type { ColumnMapping, DataType, ExcelRow } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES: DataType[] = ["ventas", "finanzas", "proyectos", "mixto"];

interface UploadBody {
  name?: string;
  fileName?: string;
  fileSize?: number;
  dataType?: string;
  columns?: ColumnMapping[];
  headers?: string[];
  rows?: ExcelRow[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UploadBody;
    const name = body.name?.trim();
    const fileName = body.fileName?.trim() || "archivo.xlsx";
    const headers = body.headers ?? [];
    const rows = body.rows ?? [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "El archivo no contiene datos." },
        { status: 400 }
      );
    }

    // Determine data type
    let dataType: DataType;
    if (body.dataType && VALID_TYPES.includes(body.dataType as DataType)) {
      dataType = body.dataType as DataType;
    } else {
      dataType = detectDataType(headers);
    }

    // Determine column mappings
    const columns: ColumnMapping[] =
      body.columns && body.columns.length > 0
        ? body.columns
        : headers.map((column) => ({
            column,
            type: suggestColumnType(column),
          }));

    const supabase = getSupabaseClient();

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        name: name || fileName,
        file_name: fileName,
        file_size: body.fileSize ?? null,
        data_type: dataType,
        row_count: rows.length,
        columns,
      })
      .select()
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: reportError?.message ?? "No se pudo crear el reporte." },
        { status: 500 }
      );
    }

    const rowsPayload = rows.map((row, index) => ({
      report_id: report.id,
      row_data: row,
      row_index: index,
    }));

    // Insert in chunks to avoid payload limits
    const chunkSize = 500;
    for (let i = 0; i < rowsPayload.length; i += chunkSize) {
      const chunk = rowsPayload.slice(i, i + chunkSize);
      const { error: dataError } = await supabase
        .from("report_data")
        .insert(chunk);
      if (dataError) {
        // best-effort cleanup
        await supabase.from("reports").delete().eq("id", report.id);
        return NextResponse.json(
          { error: dataError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error desconocido al subir.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
