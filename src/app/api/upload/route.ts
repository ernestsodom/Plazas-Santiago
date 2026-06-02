import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase";
import {
  parseExcelBuffer,
  detectDataType,
  suggestColumnType,
} from "@/lib/excel-parser";
import type { ColumnMapping, DataType } from "@/types";

export const runtime = "nodejs";

const VALID_TYPES: DataType[] = ["ventas", "finanzas", "proyectos", "mixto"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const name = (formData.get("name") as string | null)?.trim();
    const dataTypeInput = formData.get("dataType") as string | null;
    const columnsInput = formData.get("columns") as string | null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const parsed = parseExcelBuffer(buffer);

    if (parsed.rowCount === 0) {
      return NextResponse.json(
        { error: "El archivo no contiene datos." },
        { status: 400 }
      );
    }

    // Determine data type
    let dataType: DataType;
    if (dataTypeInput && VALID_TYPES.includes(dataTypeInput as DataType)) {
      dataType = dataTypeInput as DataType;
    } else {
      dataType = detectDataType(parsed.headers);
    }

    // Determine column mappings
    let columns: ColumnMapping[];
    if (columnsInput) {
      try {
        columns = JSON.parse(columnsInput) as ColumnMapping[];
      } catch {
        columns = parsed.headers.map((column) => ({
          column,
          type: suggestColumnType(column),
        }));
      }
    } else {
      columns = parsed.headers.map((column) => ({
        column,
        type: suggestColumnType(column),
      }));
    }

    const supabase = getSupabaseClient();

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        name: name || file.name,
        file_name: file.name,
        file_size: file.size,
        data_type: dataType,
        row_count: parsed.rowCount,
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

    const rowsPayload = parsed.rows.map((row, index) => ({
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
