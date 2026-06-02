import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, dataTypeLabel } from "@/lib/utils";
import type { Report } from "@/types";

interface RecentUploadsProps {
  reports: Report[];
}

export function RecentUploads({ reports }: RecentUploadsProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cargas recientes</CardTitle>
        <Link href="/reports" className="text-sm font-medium text-primary">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Aún no hay archivos cargados.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Filas</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.slice(0, 5).map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {dataTypeLabel(report.data_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{report.row_count ?? 0}</TableCell>
                  <TableCell className="text-slate-500">
                    {formatDateTime(report.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
