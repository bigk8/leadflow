"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

import { leadSchema, type LeadFormData } from "@/lib/validations/lead.schema";
import { createClient } from "@/lib/supabase/client";
import { LEAD_SOURCES, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants/leads";
import { cn } from "@/lib/utils";
import type { LeadRow } from "@/types/database.types";

import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* ─── Field wrapper ─────────────────────────────────────────────────────── */

function Field({
  label,
  error,
  required,
  children,
}: {
  label:     string;
  error?:    string;
  required?: boolean;
  children:  React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className={cn(required && "after:content-['*'] after:text-destructive after:ms-0.5")}>
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface LeadFormProps {
  lead?:   LeadRow;   // undefined = create mode
  userId:  string;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function LeadForm({ lead, userId }: LeadFormProps) {
  const router   = useRouter();
  const supabase = createClient();
  const isEdit   = !!lead;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: lead
      ? {
          first_name:        lead.first_name,
          last_name:         lead.last_name,
          email:             lead.email             ?? "",
          phone:             lead.phone             ?? "",
          company:           lead.company           ?? "",
          position:          lead.position          ?? "",
          website:           lead.website           ?? "",
          status:            lead.status,
          priority:          lead.priority,
          source:            lead.source            ?? "",
          deal_value:        lead.deal_value        ?? undefined,
          notes:             lead.notes             ?? "",
          next_follow_up_at: lead.next_follow_up_at
            ? lead.next_follow_up_at.slice(0, 16) // datetime-local format
            : "",
        }
      : {
          status:   "new",
          priority: "medium",
        },
  });

  /* ── Submit ──────────────────────────────────────────────────────────── */

  const onSubmit = async (data: LeadFormData) => {
    // Clean empty strings → null
    const payload = {
      ...data,
      email:             data.email             || null,
      phone:             data.phone             || null,
      company:           data.company           || null,
      position:          data.position          || null,
      website:           data.website           || null,
      source:            data.source            || null,
      notes:             data.notes             || null,
      deal_value:        data.deal_value        ?? null,
      next_follow_up_at: data.next_follow_up_at
        ? new Date(data.next_follow_up_at).toISOString()
        : null,
    };

    if (isEdit) {
      const { error } = await supabase
        .from("leads")
        .update(payload as unknown as never)
        .eq("id", lead.id);

      if (error) { toast.error("שגיאה בעדכון הליד"); return; }
      toast.success("הליד עודכן בהצלחה");
      router.push(`/leads/${lead.id}`);
      router.refresh();
    } else {
      const { data: created, error } = await supabase
        .from("leads")
        .insert([{ ...payload, user_id: userId }] as any)
        .select("id")
        .single() as unknown as { data: { id: string } | null; error: unknown };

      if (error) { toast.error("שגיאה ביצירת הליד"); return; }
      toast.success("הליד נוצר בהצלחה! 🎉");
      router.push(`/leads/${created!.id}`);
      router.refresh();
    }
  };

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* ── Section 1: פרטי קשר ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">פרטי קשר</CardTitle>
          <CardDescription>מידע בסיסי על הליד</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="שם פרטי" error={errors.first_name?.message} required>
              <Input
                placeholder="ישראל"
                className={cn("h-10", errors.first_name && "border-destructive")}
                {...register("first_name")}
              />
            </Field>
            <Field label="שם משפחה" error={errors.last_name?.message} required>
              <Input
                placeholder="ישראלי"
                className={cn("h-10", errors.last_name && "border-destructive")}
                {...register("last_name")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="אימייל" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="israel@example.com"
                dir="ltr"
                className={cn("h-10", errors.email && "border-destructive")}
                {...register("email")}
              />
            </Field>
            <Field label="טלפון" error={errors.phone?.message}>
              <Input
                type="tel"
                placeholder="050-0000000"
                dir="ltr"
                className={cn("h-10", errors.phone && "border-destructive")}
                {...register("phone")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="חברה" error={errors.company?.message}>
              <Input
                placeholder="שם החברה"
                className="h-10"
                {...register("company")}
              />
            </Field>
            <Field label="תפקיד" error={errors.position?.message}>
              <Input
                placeholder="מנהל שיווק"
                className="h-10"
                {...register("position")}
              />
            </Field>
          </div>

          <Field label="אתר אינטרנט" error={errors.website?.message}>
            <Input
              type="url"
              placeholder="https://example.com"
              dir="ltr"
              className={cn("h-10", errors.website && "border-destructive")}
              {...register("website")}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Section 2: פייפליין ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">פייפליין ועסקה</CardTitle>
          <CardDescription>סטטוס הליד ופרטי העסקה</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <Field label="סטטוס" error={errors.status?.message} required>
              <Select
                defaultValue={watch("status")}
                onValueChange={(v) => setValue("status", v as LeadFormData["status"], { shouldDirty: true })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="בחר סטטוס" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_LABELS) as [LeadFormData["status"], string][]).map(
                    ([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>

            {/* Priority */}
            <Field label="עדיפות" error={errors.priority?.message} required>
              <Select
                defaultValue={watch("priority")}
                onValueChange={(v) => setValue("priority", v as LeadFormData["priority"], { shouldDirty: true })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="בחר עדיפות" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [LeadFormData["priority"], string][]).map(
                    ([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>

            {/* Source */}
            <Field label="מקור ליד" error={errors.source?.message}>
              <Select
                defaultValue={watch("source") ?? ""}
                onValueChange={(v) => setValue("source", v, { shouldDirty: true })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="בחר מקור" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Deal value */}
            <Field label="ערך עסקה (₪)" error={errors.deal_value?.message}>
              <Input
                type="number"
                placeholder="0"
                min="0"
                step="100"
                dir="ltr"
                className={cn("h-10", errors.deal_value && "border-destructive")}
                {...register("deal_value")}
              />
            </Field>

            {/* Follow-up date */}
            <Field label="מועד מעקב הבא" error={errors.next_follow_up_at?.message}>
              <Input
                type="datetime-local"
                dir="ltr"
                className="h-10"
                {...register("next_follow_up_at")}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: הערות ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">הערות</CardTitle>
          <CardDescription>מידע נוסף על הליד</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="הערות חופשיות" error={errors.notes?.message}>
            <Textarea
              placeholder="פרטים נוספים, רקע, דרישות מיוחדות..."
              rows={5}
              className={cn("resize-none", errors.notes && "border-destructive")}
              {...register("notes")}
            />
          </Field>
        </CardContent>
      </Card>

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || (isEdit && !isDirty)}
          className="gap-2 min-w-[140px]"
        >
          {isSubmitting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Save    className="w-4 h-4" />
          }
          {isSubmitting
            ? "שומר..."
            : isEdit ? "שמור שינויים" : "צור ליד"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          ביטול
        </Button>

        {isEdit && !isDirty && (
          <span className="text-sm text-muted-foreground me-auto">
            אין שינויים לשמירה
          </span>
        )}
      </div>
    </form>
  );
}
