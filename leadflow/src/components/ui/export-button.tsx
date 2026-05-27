"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface ExportColumn<T> {
  header:    string;          // column header in Hebrew
  key:       keyof T | string;
  width?:    number;          // column width in chars
  format?:   (value: unknown, row: T) => string | number | null;
}

export interface ExportSheetConfig<T> {
  sheetName: string;
  data:      T[];
  columns:   ExportColumn<T>[];
}

interface ExportButtonProps {
  /** Pass one sheet for simple export, multiple for multi-sheet workbook */
  sheets:       ExportSheetConfig<unknown>[] | (() => Promise<ExportSheetConfig<unknown>[]>);
  filename?:    string;
  label?:       string;
  variant?:     "default" | "outline" | "ghost";
  size?:        "default" | "sm" | "lg" | "icon";
  className?:   string;
  /** Show dropdown with format choices (xlsx / csv) */
  multiFormat?: boolean;
}

/* ─── Core export logic ──────────────────────────────────────────────────── */

function buildWorkbook<T>(sheets: ExportSheetConfig<T>[]): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ sheetName, data, columns }) => {
    // Build rows array: first row = headers, rest = data
    const headers = columns.map((c) => c.header);
    const rows    = data.map((row) =>
      columns.map((col) => {
        const raw = col.key.toString().split(".").reduce(
          (obj: unknown, k) =>
            obj != null && typeof obj === "object"
              ? (obj as Record<string, unknown>)[k]
              : undefined,
          row as unknown
        );
        return col.format ? col.format(raw, row) : (raw ?? "");
      })
    );

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Column widths
    ws["!cols"] = columns.map((c) => ({ wch: c.width ?? 18 }));

    // RTL direction for the sheet
    if (!ws["!sheetView"]) ws["!sheetView"] = [{}];
    (ws["!sheetView"] as { rightToLeft?: boolean }[])[0].rightToLeft = true;

    // Header row style — bold
    const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1");
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  return wb;
}

async function resolveSheets(
  sheets: ExportButtonProps["sheets"]
): Promise<ExportSheetConfig<unknown>[]> {
  if (typeof sheets === "function") return sheets();
  return sheets;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function ExportButton({
  sheets,
  filename    = "leadflow-export",
  label       = "ייצוא",
  variant     = "outline",
  size        = "default",
  className,
  multiFormat = false,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const doExport = async (format: "xlsx" | "csv" = "xlsx") => {
    setExporting(true);
    try {
      const resolved = await resolveSheets(sheets);
      if (resolved.every((s) => s.data.length === 0)) {
        toast.warning("אין נתונים לייצוא");
        return;
      }

      const wb = buildWorkbook(resolved);
      const ts = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      if (format === "csv" && resolved.length === 1) {
        XLSX.writeFile(wb, `${filename}-${ts}.csv`, { type: "file", bookType: "csv" });
      } else {
        XLSX.writeFile(wb, `${filename}-${ts}.xlsx`, { compression: true });
      }

      const totalRows = resolved.reduce((s, sh) => s + sh.data.length, 0);
      toast.success(`יוצאו ${totalRows} שורות בהצלחה`);
    } catch (err) {
      console.error("Export error:", err);
      toast.error("שגיאה בייצוא — נסה שוב");
    } finally {
      setExporting(false);
    }
  };

  if (!multiFormat) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("gap-2", className)}
        onClick={() => doExport("xlsx")}
        disabled={exporting}
      >
        {exporting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />
        }
        {exporting ? "מייצא..." : label}
      </Button>
    );
  }

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          disabled={exporting}
        >
          {exporting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Download className="w-4 h-4" />
          }
          {exporting ? "מייצא..." : label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>בחר פורמט</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => doExport("xlsx")}>
          📊 Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => doExport("csv")}>
          📄 CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
