"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

import { cn, formatBytes } from "@/lib/utils";

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
}

const ACCEPTED = [".xlsx", ".xls"];

function isAccepted(name: string): boolean {
  return ACCEPTED.some((ext) => name.toLowerCase().endsWith(ext));
}

export function FileUpload({ file, onFileSelect }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (!isAccepted(f.name)) {
        setError("Formato no válido. Usa archivos .xlsx o .xls.");
        return;
      }
      setError(null);
      onFileSelect(f);
    },
    [onFileSelect]
  );

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
          dragging
            ? "border-primary bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-primary"
        )}
      >
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <FileSpreadsheet className="h-10 w-10 text-emerald-600" />
            <p className="font-medium text-slate-800">{file.name}</p>
            <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
            <p className="text-xs text-primary">Haz clic para cambiar</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-10 w-10 text-slate-400" />
            <p className="font-medium text-slate-700">
              Arrastra tu archivo Excel aquí
            </p>
            <p className="text-sm text-slate-500">
              o haz clic para seleccionar (.xlsx, .xls)
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
