"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";
import {
  Phone, Plus, Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Search, X, SlidersHorizontal, Star,
  AlertCircle,
} from "lucide-react";

import { createClient }    from "@/lib/supabase/client";
import { cn, formatCurrency, formatRelative, formatDateShort } from "@/lib/utils";
import {
  STATUS_LABELS, STATUS_COLORS,
  PRIORITY_LABELS, PRIORITY_DOT,
  LEAD_SOURCES,
} from "@/lib/constants/leads";
import type { LeadRow, LeadStatus, LeadPriority } from "@/types/database.types";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── Badge ─────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
      STATUS_COLORS[status]
    )}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function PriorityDot({ priority }: { priority: LeadPriority }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={cn("w-2 h-2 rounded-full flex-shrink-0", PRIORITY_DOT[priority])} />
      <span className="text-muted-foreground">{PRIORITY_LABELS[priority]}</span>
    </span>
  );
}

/* ─── Sort icon ─────────────────────────────────────────────────────────── */

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted)        return <ArrowUpDown className="w-3.5 h-3.5 ms-1 opacity-40" />;
  if (sorted === "asc")  return <ArrowUp   className="w-3.5 h-3.5 ms-1 text-primary" />;
  return <ArrowDown className="w-3.5 h-3.5 ms-1 text-primary" />;
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface LeadsTableProps {
  initialData: LeadRow[];
  initialSearchQuery?: string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function LeadsTable({ initialData, initialSearchQuery = "" }: LeadsTableProps) {
  const router    = useRouter();
  const supabase  = createClient();
  const [isPending, startTransition] = useTransition();

  // Table state
  const [data,            setData]           = useState<LeadRow[]>(initialData);
  const [sorting,         setSorting]        = useState<SortingState>([{ id: "created_at", desc: true }]);
  const [columnFilters,   setColumnFilters]  = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter,    setGlobalFilter]   = useState(initialSearchQuery);

  // UI state
  const [deleteId,           setDeleteId]          = useState<string | null>(null);
  const [statusFilter,       setStatusFilter]      = useState<string>("all");
  const [priorityFilter,     setPriorityFilter]    = useState<string>("all");
  const [sourceFilter,       setSourceFilter]      = useState<string>("all");
  const [favoritesFilter,    setFavoritesFilter]   = useState(false);
  const [hideIrrelevant,     setHideIrrelevant]    = useState(true);
  const [pageInput,          setPageInput]         = useState<string>("");
  const [selectedIds,        setSelectedIds]       = useState<Set<string>>(new Set());

  /* ── Delete ──────────────────────────────────────────────────────────── */

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("leads").delete().eq("id", deleteId);
    if (error) { toast.error("שגיאה במחיקת הליד"); return; }
    setData((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("הליד נמחק");
  };

  /* ── Mark as irrelevant ───────────────────────────────────────────────── */

  const handleToggleIrrelevant = useCallback(async (leadId: string, isIrrelevant: boolean) => {
    try {
      const { error } = await supabase
        .from("leads")
        // @ts-expect-error - Supabase client type inference issue with new columns
        .update({ is_irrelevant: isIrrelevant })
        .eq("id", leadId);

      if (error) {
        toast.error("שגיאה בעדכון: " + (error.message || "Unknown error"));
        return;
      }

      // Optimistic update
      setData((prev) =>
        prev.map((r) => r.id === leadId ? { ...r, is_irrelevant: isIrrelevant } : r)
      );

      toast.success(isIrrelevant ? "סומן כלא רלוונטי ✓" : "הוסר מלא רלוונטי");
    } catch (err) {
      toast.error("שגיאה בלתי צפויה");
      console.error("Error:", err);
    }
  }, [supabase]);

  /* ── Toggle favorite ───────────────────────────────────────────────────── */

  const handleToggleFavorite = useCallback(async (leadId: string, isFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from("leads")
        // @ts-expect-error - Supabase client type inference issue with new columns
        .update({ is_favorite: isFavorite })
        .eq("id", leadId);

      if (error) {
        // Check if it's a column doesn't exist error
        if (error.message.includes("is_favorite") || error.code === "42703") {
          // Column doesn't exist - show helpful error with link to docs
          const errorMsg = "עמודת is_favorite לא קיימת בדאטהבייס.\nאנא היכנס ל-Supabase ליישם את ה-migration";
          toast.error(errorMsg);

          // Log for debugging
          console.warn("is_favorite column migration needed");
          console.log("To fix, run this SQL in Supabase dashboard:");
          console.log(`
            ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;
            CREATE INDEX IF NOT EXISTS idx_leads_is_favorite ON public.leads(user_id, is_favorite) WHERE is_favorite = true;
          `);
          return;
        } else {
          toast.error("שגיאה בעדכון: " + (error.message || "Unknown error"));
          console.error("Update error:", error);
        }
        return;
      }

      // Update successful
      setData((prev) =>
        prev.map((r) => r.id === leadId ? { ...r, is_favorite: isFavorite } : r)
      );

      toast.success(isFavorite ? "נוסף להועדפים ⭐" : "הוסר מהעדפים");
    } catch (err) {
      toast.error("שגיאה בלתי צפויה");
      console.error("Unexpected error:", err);
    }
  }, [supabase]);

  /* ── Filtered data (status + priority + source + global search) ──────── */

  const filteredData = useMemo(() => {
    return data.filter((lead) => {
      if (hideIrrelevant && lead.is_irrelevant)                           return false;
      if (statusFilter   !== "all" && lead.status   !== statusFilter)   return false;
      if (priorityFilter !== "all" && lead.priority !== priorityFilter) return false;
      if (sourceFilter   !== "all" && lead.source   !== sourceFilter)   return false;
      if (favoritesFilter && !lead.is_favorite)                          return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const haystack = [
          lead.first_name, lead.last_name,
          lead.email, lead.phone, lead.company,
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data, statusFilter, priorityFilter, sourceFilter, favoritesFilter, hideIrrelevant, globalFilter]);

  /* ── Column definitions ──────────────────────────────────────────────── */

  const columns = useMemo<ColumnDef<LeadRow>[]>(() => [
    // Checkbox selection
    {
      id: "select",
      header: () => (
        <input
          type="checkbox"
          checked={selectedIds.size > 0 && selectedIds.size === filteredData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(new Set(filteredData.map(l => l.id)));
            } else {
              setSelectedIds(new Set());
            }
          }}
          className="rounded border-border"
          title={selectedIds.size > 0 ? `${selectedIds.size} לידים נבחרים` : "בחר הכל"}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.id)}
          onChange={(e) => {
            const newSelected = new Set(selectedIds);
            if (e.target.checked) {
              newSelected.add(row.original.id);
            } else {
              newSelected.delete(row.original.id);
            }
            setSelectedIds(newSelected);
          }}
          className="rounded border-border"
        />
      ),
      size: 40,
    },

    // שם מלא
    {
      id: "full_name",
      header: ({ column }) => (
        <button
          className="flex items-center font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          שם
          <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      accessorFn: (r) => `${r.first_name} ${r.last_name}`,
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div>
            <Link
              href={`/leads/${lead.id}`}
              className="font-medium hover:text-primary transition-colors text-right"
            >
              {lead.first_name} {lead.last_name}
            </Link>
            {lead.position && (
              <p className="text-xs text-muted-foreground mt-0.5">{lead.position}</p>
            )}
          </div>
        );
      },
    },

    // חברה
    {
      accessorKey: "company",
      header: "חברה",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground text-sm">
          {(getValue() as string) || "—"}
        </span>
      ),
    },

    // טלפון
    {
      accessorKey: "phone",
      header: "טלפון",
      cell: ({ getValue }) => {
        const phone = getValue() as string | null;
        if (!phone) return <span className="text-muted-foreground">—</span>;
        return (
          <a
            href={`tel:${phone}`}
            className="text-sm font-mono hover:text-primary transition-colors"
            dir="ltr"
          >
            {phone}
          </a>
        );
      },
    },

    // קישור דפי זהב
    {
      id: "leads_link",
      header: "מקור",
      cell: ({ row }) => {
        const lead = row.original;
        const website = lead.website || "";

        // אם אין קישור, הצג "אין"
        if (!website) {
          return <span className="text-muted-foreground text-xs">אין</span>;
        }

        return (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
              "text-xs font-medium text-white bg-blue-600",
              "hover:bg-blue-700 transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
            title="פתח בדפי זהב"
          >
            🔗 דפי זהב
          </a>
        );
      },
    },

    // סטטוס
    {
      accessorKey: "status",
      header: "סטטוס",
      cell: ({ getValue }) => <StatusBadge status={getValue() as LeadStatus} />,
    },

    // עדיפות
    {
      accessorKey: "priority",
      header: "עדיפות",
      cell: ({ getValue }) => <PriorityDot priority={getValue() as LeadPriority} />,
    },

    // ערך עסקה
    {
      accessorKey: "deal_value",
      header: ({ column }) => (
        <button
          className="flex items-center font-medium"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ערך עסקה
          <SortIcon sorted={column.getIsSorted()} />
        </button>
      ),
      cell: ({ getValue }) => {
        const val = getValue() as number | null;
        if (!val) return <span className="text-muted-foreground">—</span>;
        return <span className="font-medium tabular-nums">{formatCurrency(val)}</span>;
      },
    },

    // מעקב הבא
    {
      accessorKey: "next_follow_up_at",
      header: "מעקב הבא",
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        if (!val) return <span className="text-muted-foreground">—</span>;
        const isOverdue = new Date(val) < new Date();
        return (
          <span className={cn(
            "text-sm whitespace-nowrap",
            isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {formatDateShort(val)}
          </span>
        );
      },
    },

    // created_at (hidden, used for sorting)
    {
      accessorKey: "created_at",
      header: "נוצר",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelative(getValue() as string)}
        </span>
      ),
    },

    // פעולות
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const lead = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            {/* Log Call — quick action */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-primary"
              title="תיעוד שיחה"
              onClick={() => router.push(`/leads/${lead.id}?action=log-call`)}
            >
              <Phone className="w-3.5 h-3.5" />
            </Button>

            {/* Star — quick action */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-yellow-500"
              title={lead.is_favorite ? "הסר מהעדפים" : "הוסף להעדפים"}
              onClick={() => handleToggleFavorite(lead.id, !lead.is_favorite)}
            >
              <Star
                className="w-3.5 h-3.5"
                fill={lead.is_favorite ? "currentColor" : "none"}
              />
            </Button>

            {/* Not Relevant — quick action */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-8",
                lead.is_irrelevant
                  ? "text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-950/20"
                  : "text-muted-foreground hover:text-orange-500"
              )}
              title={lead.is_irrelevant ? "סמן כרלוונטי" : "סמן כלא רלוונטי"}
              onClick={() => handleToggleIrrelevant(lead.id, !lead.is_irrelevant)}
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </Button>

            {/* Delete button - Direct */}
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="מחק ליד"
              onClick={() => setDeleteId(lead.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>

            {/* More */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)}>
                  צפה בפרטים
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}/edit`)}>
                  <Pencil className="w-3.5 h-3.5 me-2" />
                  עריכה
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/leads/${lead.id}?action=new-task`)}
                >
                  <Plus className="w-3.5 h-3.5 me-2" />
                  משימה חדשה
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleToggleIrrelevant(lead.id, !lead.is_irrelevant)}
                  className={lead.is_irrelevant ? "text-orange-600" : ""}
                >
                  <AlertCircle className="w-3.5 h-3.5 me-2" />
                  {lead.is_irrelevant ? "הסר מלא רלוונטי" : "סמן כלא רלוונטי"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [router, handleToggleFavorite, handleToggleIrrelevant, selectedIds, filteredData, setSelectedIds]);

  /* ── Table instance ──────────────────────────────────────────────────── */

  const table = useReactTable({
    data: filteredData,
    columns,
    state:         { sorting, columnFilters, columnVisibility },
    onSortingChange:          setSorting,
    onColumnFiltersChange:    setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel:          getCoreRowModel(),
    getSortedRowModel:        getSortedRowModel(),
    getFilteredRowModel:      getFilteredRowModel(),
    getPaginationRowModel:    getPaginationRowModel(),
    initialState:             { pagination: { pageSize: 20 } },
  });

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    sourceFilter !== "all" ||
    favoritesFilter ||
    globalFilter !== "";

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSourceFilter("all");
    setFavoritesFilter(false);
    setGlobalFilter("");
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-4">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="חיפוש לפי שם, חברה, אימייל, טלפון..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pr-9 h-9"
          />
          {globalFilter && (
            <button
              onClick={() => setGlobalFilter("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-1.5 flex-wrap md:gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[115px] md:w-[140px] text-xs md:text-sm">
              <SelectValue placeholder="סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הסטטוסים</SelectItem>
              {(Object.entries(STATUS_LABELS) as [LeadStatus, string][]).map(([v, l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Priority filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-[110px] md:w-[130px] text-xs md:text-sm">
              <SelectValue placeholder="עדיפות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל העדיפויות</SelectItem>
              <SelectItem value="high">גבוהה</SelectItem>
              <SelectItem value="medium">בינונית</SelectItem>
              <SelectItem value="low">נמוכה</SelectItem>
            </SelectContent>
          </Select>

          {/* Source filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-9 w-[115px] md:w-[130px] text-xs md:text-sm">
              <SelectValue placeholder="מקור" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל המקורות</SelectItem>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Favorites filter */}
          <Button
            variant={favoritesFilter ? "default" : "outline"}
            size="sm"
            onClick={() => setFavoritesFilter(!favoritesFilter)}
            className="h-9 gap-1 md:gap-1.5 px-2 md:px-3 text-xs md:text-sm"
            title={favoritesFilter ? "הסר סינון מועדפים" : "הסנן רק מועדפים"}
          >
            <Star className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">מועדפים</span>
          </Button>

          {/* Not Relevant filter */}
          <Button
            variant={!hideIrrelevant ? "default" : "outline"}
            size="sm"
            onClick={() => setHideIrrelevant(!hideIrrelevant)}
            className="h-9 gap-1 md:gap-1.5 px-2 md:px-3 text-xs md:text-sm"
            title={hideIrrelevant ? "הצג לא רלוונטי" : "הסתר לא רלוונטי"}
          >
            <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">
              {hideIrrelevant ? "לא רלוונטי" : "הכל"}
            </span>
          </Button>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1 px-2 text-xs md:text-sm text-muted-foreground">
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">נקה</span>
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
                    <TableHead
                      key={header.id}
                      className="text-right font-semibold text-foreground/80 h-11 px-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center text-muted-foreground"
                  >
                    {hasActiveFilters
                      ? "לא נמצאו לידים התואמים את הסינון"
                      : "עדיין אין לידים — הוסף ליד ראשון!"}
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/20 transition-colors cursor-default"
                  >
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-muted-foreground">
        <span className="text-xs md:text-sm">
          {filteredData.length} לידים
          {hasActiveFilters && ` (מסונן מתוך ${data.length})`}
        </span>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {/* First page button */}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => {
              table.setPageIndex(0);
              setPageInput("");
            }}
            disabled={!table.getCanPreviousPage()}
            title="לעמוד הראשון"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>

          {/* Previous page button */}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="עמוד קודם"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 px-2">
            {(() => {
              const currentPage = table.getState().pagination.pageIndex;
              const pageCount = table.getPageCount();
              const visiblePages = 5;
              const halfVisible = Math.floor(visiblePages / 2);

              // חישוב טווח עמודים להצגה
              let startPage = Math.max(0, currentPage - halfVisible);
              const endPage = Math.min(pageCount - 1, startPage + visiblePages - 1);

              // התאם את ההתחלה אם קרובים לסוף
              if (endPage - startPage < visiblePages - 1) {
                startPage = Math.max(0, endPage - visiblePages + 1);
              }

              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              return pages.map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs font-medium",
                    pageNum === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                  onClick={() => {
                    table.setPageIndex(pageNum);
                    setPageInput("");
                  }}
                  title={`עמוד ${pageNum + 1}`}
                >
                  {pageNum + 1}
                </Button>
              ));
            })()}
          </div>

          {/* Next page button */}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="עמוד הבא"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Last page button */}
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={() => {
              table.setPageIndex(table.getPageCount() - 1);
              setPageInput("");
            }}
            disabled={!table.getCanNextPage()}
            title="לעמוד האחרון"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>

          {/* Direct page jump */}
          <div className="flex items-center gap-1 ps-2 border-s border-border">
            <input
              type="number"
              min="1"
              max={table.getPageCount()}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const page = parseInt(pageInput, 10);
                  if (page >= 1 && page <= table.getPageCount()) {
                    table.setPageIndex(page - 1);
                    setPageInput("");
                  }
                }
              }}
              placeholder={`עמוד (1-${table.getPageCount()})`}
              className={cn(
                "w-16 h-8 px-2 py-1 text-xs rounded-md border border-border",
                "bg-background text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-1 focus:ring-primary"
              )}
              title="הקלד מספר עמוד והקש Enter"
            />
            <span className="text-xs text-muted-foreground ms-1">
              עמוד {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Delete confirm dialog ─────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(o: boolean) => !o && setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת ליד</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק ליד זה? פעולה זו בלתי הפיכה — כל השיחות
              והמשימות הקשורות יימחקו גם הן.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
