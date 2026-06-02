"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { FileUpload } from "@/components/upload/FileUpload";
import { ColumnMapper } from "@/components/upload/ColumnMapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import {
  parseExcelFile,
  detectDataType,
  suggestColumnType,
} from "@/lib/excel-parser";
import type { ColumnMapping, DataType, ParsedExcel } from "@/types";

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: "ventas", label: "Ventas" },
  { value: "finanzas", label: "Finanzas" },
  { value: "proyectos", label: "Proyectos" },
  { value: "mixto", label: "Mixto" },
];

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedExcel | null>(null);
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState<DataType>("mixto");
  const [columns, setColumns] = useState<ColumnMapping[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileSelect(f: File) {
    setFile(f);
    setName(f.name.replace(/\.(xlsx|xls)$/i, ""));
    try {
      const result = await parseExcelFile(f);
      setParsed(result);
      setDataType(detectDataType(result.headers));
      setColumns(
        result.headers.map((column) => ({
          column,
          type: suggestColumnType(column),
        }))
      );
    } catch {
      toast({
        variant: "destructive",
        title: "Error al leer el archivo",
        description: "No se pudo procesar el Excel. Verifica el formato.",
      });
    }
  }

  async function handleSubmit() {
    if (!file || !parsed) {
      toast({
        variant: "destructive",
        title: "Falta el archivo",
        description: "Selecciona un archivo Excel para continuar.",
      });
      return;
    }
    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Falta el nombre",
        description: "Ingresa un nombre para el reporte.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name.trim());
      formData.append("dataType", dataType);
      formData.append("columns", JSON.stringify(columns));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Error al subir el archivo.");

      toast({
        title: "Archivo subido",
        description: `${parsed.rowCount} filas guardadas correctamente.`,
      });
      router.push("/reports");
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: err instanceof Error ? err.message : "Error desconocido.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const previewRows = parsed?.rows.slice(0, 5) ?? [];

  return (
    <>
      <Header
        title="Subir Archivo"
        subtitle="Carga un Excel y mapea sus columnas para generar el dashboard"
      />
      <main className="space-y-6 p-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>1. Selecciona el archivo</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload file={file} onFileSelect={handleFileSelect} />
          </CardContent>
        </Card>

        {parsed && (
          <>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>2. Información del reporte</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="report-name">Nombre del reporte</Label>
                  <Input
                    id="report-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ventas Q1 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de datos</Label>
                  <Select
                    value={dataType}
                    onValueChange={(v) => setDataType(v as DataType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>
                  3. Vista previa ({parsed.rowCount} filas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {parsed.headers.map((h) => (
                        <TableHead key={h}>{h}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i}>
                        {parsed.headers.map((h) => (
                          <TableCell key={h}>
                            {row[h] === null || row[h] === undefined
                              ? "—"
                              : String(row[h])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>4. Mapeo de columnas</CardTitle>
              </CardHeader>
              <CardContent>
                <ColumnMapper columns={columns} onChange={setColumns} />
                <Separator className="my-6" />
                <div className="flex justify-end">
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {submitting ? "Guardando..." : "Guardar reporte"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
