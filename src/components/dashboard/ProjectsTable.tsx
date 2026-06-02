import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface ProjectRow {
  nombre: string;
  estado: string;
  porcentaje: number;
}

interface ProjectsTableProps {
  rows: ProjectRow[];
}

function estadoVariant(estado: string): "default" | "secondary" | "outline" {
  const e = estado.toLowerCase();
  if (e.includes("complet") || e.includes("finaliz")) return "default";
  if (e.includes("progres") || e.includes("curso")) return "secondary";
  return "outline";
}

export function ProjectsTable({ rows }: ProjectsTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>KPIs de proyectos</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No hay datos de proyectos disponibles.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[40%]">Avance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={`${row.nombre}-${i}`}>
                  <TableCell className="font-medium">{row.nombre}</TableCell>
                  <TableCell>
                    <Badge variant={estadoVariant(row.estado)}>
                      {row.estado || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.porcentaje} className="flex-1" />
                      <span className="w-10 text-right text-xs text-slate-500">
                        {Math.round(row.porcentaje)}%
                      </span>
                    </div>
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
