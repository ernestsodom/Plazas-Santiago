import { NextRequest, NextResponse } from "next/server";

import { getSupabaseClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();

    const { data: report, error: reportError } = await supabase
      .from("reports")
      .select("*")
      .eq("id", params.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: reportError?.message ?? "Reporte no encontrado." },
        { status: 404 }
      );
    }

    const { data: rows, error: rowsError } = await supabase
      .from("report_data")
      .select("*")
      .eq("report_id", params.id)
      .order("row_index", { ascending: true });

    if (rowsError) {
      return NextResponse.json({ error: rowsError.message }, { status: 500 });
    }

    return NextResponse.json({ report, rows: rows ?? [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al obtener el reporte.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar el reporte.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
