"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { ColumnMapping, ColumnType } from "@/types";

const COLUMN_TYPES: { value: ColumnType; label: string }[] = [
  { value: "fecha", label: "Fecha" },
  { value: "monto", label: "Monto" },
  { value: "categoria", label: "Categoría" },
  { value: "descripcion", label: "Descripción" },
  { value: "estado", label: "Estado" },
  { value: "porcentaje", label: "Porcentaje" },
  { value: "nombre", label: "Nombre" },
  { value: "otro", label: "Otro" },
];

interface ColumnMapperProps {
  columns: ColumnMapping[];
  onChange: (columns: ColumnMapping[]) => void;
}

export function ColumnMapper({ columns, onChange }: ColumnMapperProps) {
  const update = (index: number, type: ColumnType) => {
    const next = columns.map((c, i) => (i === index ? { ...c, type } : c));
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {columns.map((col, index) => (
        <div key={col.column} className="space-y-1.5">
          <Label className="truncate" title={col.column}>
            {col.column}
          </Label>
          <Select
            value={col.type}
            onValueChange={(v) => update(index, v as ColumnType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLUMN_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
