"use client";

import { useEffect, useState } from "react";
import { Database, FileStack, CalendarRange, Clock } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { KPICard } from "@/components/dashboard/KPICard";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { FinanceChart } from "@/components/dashboard/FinanceChart";
import {
  ProjectsTable,
  type ProjectRow,
} from "@/components/dashboard/ProjectsTable";
import { RecentUploads } from "@/components/dashboard/RecentUploads";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatDateTime } from "@/lib/utils";
import {
  buildMonthlyTrend,
  buildCategoryBreakdown,
  buildProjectRows,
} from "@/lib/analytics";
import type { ChartPoint, Report, ReportData } from "@/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [trend, setTrend] = useState<ChartPoint[]>([]);
  const [categories, setCategories] = useState<ChartPoint[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/reports", { cache: "no-store" });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Error al cargar reportes.");
        const list: Report[] = body.reports ?? [];
        if (cancelled) return;
        setReports(list);

        if (list.length > 0) {
          const latest = list[0];
          const detailRes = await fetch(`/api/reports/${latest.id}`, {
            cache: "no-store",
          });
          const detail = await detailRes.json();
          if (detailRes.ok && !cancelled) {
            const rows: ReportData[] = detail.rows ?? [];
            const report: Report = detail.report;
            setTrend(buildMonthlyTrend(report, rows));
            setCategories(buildCategoryBreakdown(report, rows));
            setProjects(buildProjectRows(report, rows));
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error desconocido.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalRegistros = reports.reduce(
    (acc, r) => acc + (r.row_count ?? 0),
    0
  );
  const ultimoUpload = reports[0]?.created_at ?? null;
  const fechas = reports.map((r) => new Date(r.created_at).getTime());
  const periodoCubierto =
    fechas.length > 0
      ? `${formatDateTime(new Date(Math.min(...fechas))).split(",")[0]}`
      : "—";

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Resumen de KPIs de ventas, finanzas y proyectos"
      />
      <main className="space-y-6 p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Total Registros"
              value={formatNumber(totalRegistros)}
              icon={Database}
            />
            <KPICard
              title="Reportes Subidos"
              value={formatNumber(reports.length)}
              icon={FileStack}
              accentClassName="bg-emerald-50 text-emerald-600"
            />
            <KPICard
              title="Período Cubierto"
              value={periodoCubierto}
              icon={CalendarRange}
              accentClassName="bg-amber-50 text-amber-600"
            />
            <KPICard
              title="Último Upload"
              value={ultimoUpload ? formatDateTime(ultimoUpload) : "—"}
              icon={Clock}
              accentClassName="bg-violet-50 text-violet-600"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <Skeleton className="h-[380px] w-full" />
              <Skeleton className="h-[380px] w-full" />
            </>
          ) : (
            <>
              <SalesChart data={trend} />
              <FinanceChart data={categories} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : (
            <>
              <ProjectsTable rows={projects} />
              <RecentUploads reports={reports} />
            </>
          )}
        </div>
      </main>
    </>
  );
}
