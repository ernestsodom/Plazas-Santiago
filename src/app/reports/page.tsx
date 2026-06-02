"use client";

import { useEffect, useState } from "react";
import { Trash2, Eye, Loader2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  formatBytes,
  formatDateTime,
  dataTypeLabel,
  formatNumber,
} from "@/lib/utils";
import type { Report, ReportData } from "@/types";

export default function ReportsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [detailReport, setDetailReport] = useState<Report | null>(null);
  const [detailRows, setDetailRows] = useState<ReportData[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setReports(body.reports ?? []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error al cargar.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Reporte eliminado" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error al eliminar.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleView(report: Report) {
    setDetailReport(report);
    setDetailLoading(true);
    setDetailRows([]);
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        cache: "no-store",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDetailRows(body.rows ?? []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error al cargar.",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  const detailHeaders =
    detailRows.length > 0 ? Object.keys(detailRows[0].row_data) : [];

  return (
    <>
      <Header
        title="Reportes"
        subtitle="Historial de archivos Excel cargados"
      />
      <main className="p-6">
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <p className="py-16 text-center text-sm text-slate-400">
                Aún no hay reportes. Sube un archivo para comenzar.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Filas</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex flex-col">
                          <span>{report.file_name}</span>
                          <span className="text-xs">
                            {formatBytes(report.file_size)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {dataTypeLabel(report.data_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(report.row_count ?? 0)}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatDateTime(report.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(report)}
                            aria-label="Ver detalle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(report.id)}
                            disabled={deletingId === report.id}
                            aria-label="Eliminar"
                          >
                            {deletingId === report.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog
        open={!!detailReport}
        onOpenChange={(open) => {
          if (!open) setDetailReport(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{detailReport?.name}</DialogTitle>
            <DialogDescription>
              {detailReport &&
                `${dataTypeLabel(detailReport.data_type)} · ${formatNumber(
                  detailReport.row_count ?? 0
                )} filas`}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-auto">
            {detailLoading ? (
              <div className="space-y-2 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {detailHeaders.map((h) => (
                      <TableHead key={h}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailRows.slice(0, 50).map((row) => (
                    <TableRow key={row.id}>
                      {detailHeaders.map((h) => (
                        <TableCell key={h}>
                          {row.row_data[h] === null ||
                          row.row_data[h] === undefined
                            ? "—"
                            : String(row.row_data[h])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
