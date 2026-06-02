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

    return NextResponse.json(
      { report, rows: rows ?? [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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

    // Delete associated rows first (in case cascade is not configured).
    await supabase.from("report_data").delete().eq("report_id", params.id);

    // Return the deleted rows so we can verify the delete actually happened.
    const { data: deleted, error } = await supabase
      .from("reports")
      .delete()
      .eq("id", params.id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // RLS can make a delete "succeed" while removing zero rows. Detect that.
    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se pudo eliminar: la base de datos bloqueó el borrado " +
            "(falta la política de eliminación en Supabase).",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar el reporte.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
