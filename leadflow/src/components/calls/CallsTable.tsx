"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, useReactTable,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import {
  PhoneOutgoing, PhoneIncoming, Video, Mail, MessageSquare,
  Users as UsersIcon, Phone, Search, X, SlidersHorizontal,
  ChevronLeft, ChevronRight, Clock, ArrowUpDown, ArrowUp, ArrowDown,
  ExternalLink,
} from "lucide-react";

import { cn, formatDateShort, formatTime, formatRelative } from "@/lib/utils";
import type { CallRow, CallType, CallOutcome } from "@/types/database.types";
import { useRealtimeCalls } from "@/hooks/useRealtimeCalls";

import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ─── Config ─────────────────────────────────────────────────────────────── */

const CALL_TYPE_CONFIG: Record<CallType, {
  label: string; icon: React.ElementType; color: string; bg: string;
}> = {
  call_outbound: { label: "יוצאת",    icon: PhoneOutgoing, color: "text-blue-500",    bg: "bg-blue-100    dark:bg-blue-950/40"    },
  call_inbound:  { label: "נכנסת",    icon: PhoneIncoming, color: "text-green-500",   bg: "bg-green-100   dark:bg-green-950/40"   },
  meeting:       { label: "פגישה",    icon: UsersIcon,     color: "text-violet-500",  bg: "bg-violet-100  dark:bg-violet-950/40"  },
  video:         { label: "וידאו",    icon: Video,         color: "text-cyan-500",    bg: "bg-cyan-100    dark:bg-cyan-950/40"    },
  email:         { label: "אימייל",   icon: Mail,          color: "text-amber-500",   bg: "bg-amber-100   dark:bg-amber-950/40"   },
  whatsapp:      { label: "וואטסאפ", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/40" },
  other:         { label: "אחר",      icon: Phone,         color: "text-slate-500",   bg: "bg-slate-100   dark:bg-slate-800"      },
};

const OUTCOME_LABELS: Record<CallOutcome, { label: string; color: string }> = {
  no_answer:      { label: "לא ענה",       color: "text-slate-500" },
  left_message:   { label: "השארתי הודעה", color: "text-slate-500" },
  callback:       { label: "ביקש חזרה",    color: "text-blue-500"  },
  interested:     { label: "מעוניין",      color: "text-green-600" },
  not_interested: { label: "לא מעוניין",   color: "text-red-500"   },
  meeting_set:    { label: "נקבעה פגישה",  color: "text-violet-500"},
  deal_closed:    { label: "עסקה נסגרה",   color: "text-green-600" },
  other:          { label: "אחר",           color: "text-slate-500" },
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

export interface EnrichedCall extends CallRow {
  lead_first_name: string;
  lead_last_name:  string;
  lead_company:    string | null;
}

/* ─── Sort icon ─────────────────────────────────────────────────────────── */

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted)           return <ArrowUpDown className="w-3 h-3 ms-1 opacity-40" />;
  if (sorted === "asc")  return <ArrowUp     className="w-3 h-3 ms-1 text-primary" />;
  return                        <ArrowDown   className="w-3 h-3 ms-1 text-primary" />;
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface CallsTableProps {
  initialData:  EnrichedCall[];
  onLogCall?:   () => void;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function CallsTable({ initialData, onLogCall }: CallsTableProps) {
  const [data,           setData]          = useState<EnrichedCall[]>(initialData);
  const [sorting,        setSorting]       = useState<SortingState>([{ id: "called_at", desc: true }]);
  const [globalFilter,   setGlobalFilter]  = useState("");
  const [typeFilter,     setTypeFilter]    = useState("all");
  const [outcomeFilter,  setOutcomeFilter] = useState("all");
  const [dateFrom,       setDateFrom]      = useState("");
  const [dateTo,         setDateTo]        = useState("");

  /* ── Realtime ────────────────────────────────────────────────────────── */
  // Note: realtime inserts won't have lead name enrichment from DB join.
  // We add placeholder names and the row will be complete on next hard refresh.
  useRealtimeCalls({
    onInsert: (call) => {
      const enriched: EnrichedCall = {
        ...call,
        lead_first_name: "—",
        lead_last_name:  "",
        lead_company:    null,
      };
      setData((prev) => [enriched, ...prev]);
    },
    onUpdate: (call) => {
      setData((prev) =>
        prev.map((c) => c.id === call.id ? { ...c, ...call } : c)
      );
    },
    onDelete: (id) => setData((prev) => prev.filter((c) => c.id !== id)),
  });

  /* ── Filtered data ───────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    return data.filter((call) => {
      if (typeFilter    !== "all" && call.type    !== typeFilter)    return false;
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) return false;
      if (dateFrom) {
        if (new Date(call.called_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        if (new Date(call.called_at) >= end) return false;
      }
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const haystack = [
          call.lead_first_name, call.lead_last_name,
          call.lead_company, call.summary, call.notes,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, typeFilter, outcomeFilter, dateFrom, dateTo, globalFilter]);

  /* ── Columns ─────────────────────────────────────────────────────────── */

  const columns = useMemo<ColumnDef<EnrichedCall>[]>(() => [
    // Date + time
    {
      accessorKey: "called_at",
      header: ({ column }) => (
        <button className="flex items-center font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          תאריך <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ getValue }) => {
        const v = getValue() as string;
        return (
          <div className="tabular-nums">
            <p className="text-sm font-medium">{formatDateShort(v)}</p>
            <p className="text-xs text-muted-foreground">{formatTime(v)}</p>
          </div>
        );
      },
    },

    // Type
    {
      accessorKey: "type",
      header: "סוג",
      cell: ({ getValue }) => {
        const type = getValue() as CallType;
        const cfg  = CALL_TYPE_CONFIG[type];
        const Icon = cfg.icon;
        return (
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            cfg.bg, cfg.color
          )}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </div>
        );
      },
    },

    // Lead
    {
      id: "lead",
      header: "ליד",
      accessorFn: (r) => `${r.lead_first_name} ${r.lead_last_name}`,
      cell: ({ row }) => {
        const call = row.original;
        return (
          <Link
            href={`/leads/${call.lead_id}`}
            className="group flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <div>
              <p className="text-sm font-medium leading-tight">
                {call.lead_first_name} {call.lead_last_name}
              </p>
              {call.lead_company && (
                <p className="text-xs text-muted-foreground">{call.lead_company}</p>
              )}
            </div>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </Link>
        );
      },
    },

    // Outcome
    {
      accessorKey: "outcome",
      header: "תוצאה",
      cell: ({ getValue }) => {
        const outcome = getValue() as CallOutcome | null;
        if (!outcome) return <span className="text-muted-foreground text-sm">—</span>;
        const cfg = OUTCOME_LABELS[outcome];
        return <span className={cn("text-sm font-medium", cfg.color)}>{cfg.label}</span>;
      },
    },

    // Duration
    {
      accessorKey: "duration_seconds",
      header: "אורך",
      cell: ({ getValue }) => {
        const secs = getValue() as number | null;
        if (!secs) return <span className="text-muted-foreground">—</span>;
        const mins = Math.floor(secs / 60);
        const rem  = secs % 60;
        return (
          <span className="text-sm text-muted-foreground flex items-center gap-1 tabular-nums">
            <Clock className="w-3 h-3" />
            {mins}:{rem.toString().padStart(2, "0")}
          </span>
        );
      },
    },

    // Summary
    {
      accessorKey: "summary",
      header: "תקציר",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        if (!v) return <span className="text-muted-foreground text-sm">—</span>;
        return (
          <p className="text-sm max-w-[220px] truncate" title={v}>{v}</p>
        );
      },
    },

    // Follow-up
    {
      accessorKey: "follow_up_at",
      header: "מעקב",
      cell: ({ getValue }) => {
        const v = getValue() as string | null;
        if (!v) return <span className="text-muted-foreground">—</span>;
        const overdue = new Date(v) < new Date();
        return (
          <span className={cn(
            "text-xs font-medium",
            overdue ? "text-destructive" : "text-muted-foreground"
          )}>
            {formatDateShort(v)}
          </span>
        );
      },
    },
  ], []);

  /* ── Table instance ──────────────────────────────────────────────────── */

  const table = useReactTable({
    data:     filtered,
    columns,
    state:    { sorting },
    onSortingChange:       setSorting,
    getCoreRowModel:       getCoreRowModel(),
    getSortedRowModel:     getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 25 } },
  });

  const hasActiveFilters =
    typeFilter !== "all" || outcomeFilter !== "all" ||
    !!dateFrom || !!dateTo || !!globalFilter;

  const clearFilters = () => {
    setTypeFilter("all"); setOutcomeFilter("all");
    setDateFrom(""); setDateTo(""); setGlobalFilter("");
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">

        {/* Row 1: Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="חיפוש לפי שם, תקציר, הערות..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pr-9 h-9 text-sm"
            />
            {globalFilter && (
              <button onClick={() => setGlobalFilter("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {filtered.length} שיחות
          </span>
        </div>

        {/* Row 2: Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          {/* Type filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <SelectValue placeholder="כל הסוגים" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסוגים</SelectItem>
              {Object.entries(CALL_TYPE_CONFIG).map(([v, cfg]) => (
                <SelectItem key={v} value={v}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Outcome filter */}
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="h-9 w-[150px] text-sm">
              <SelectValue placeholder="כל התוצאות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל התוצאות</SelectItem>
              {Object.entries(OUTCOME_LABELS).map(([v, cfg]) => (
                <SelectItem key={v} value={v}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-[140px] text-sm"
              dir="ltr"
              placeholder="מתאריך"
            />
            <span className="text-muted-foreground text-xs">—</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-[140px] text-sm"
              dir="ltr"
              placeholder="עד תאריך"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}
              className="h-9 gap-1.5 text-muted-foreground">
              <X className="w-3.5 h-3.5" /> נקה
            </Button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/30 hover:bg-muted/30">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}
                      className="text-right font-semibold text-foreground/80 h-11 px-4">
                      {header.isPlaceholder ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length}
                    className="h-40 text-center text-muted-foreground">
                    {hasActiveFilters
                      ? "לא נמצאו שיחות התואמות את הסינון"
                      : "אין שיחות מתועדות עדיין — תעד שיחה ראשונה!"}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-muted/20 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{filtered.length} שיחות</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="w-8 h-8"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <Button variant="outline" size="icon" className="w-8 h-8"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
