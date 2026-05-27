"use client";

import { useState }     from "react";
import { useRouter }    from "next/navigation";
import { useForm }      from "react-hook-form";
import { zodResolver }  from "@hookform/resolvers/zod";
import { z }            from "zod";
import { toast }        from "sonner";
import { useTheme }     from "next-themes";
import {
  User, Shield, Palette, Trash2,
  Save, Loader2, Eye, EyeOff, LogOut, Check,
} from "lucide-react";

import { createClient }   from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/* ─── Schemas ─────────────────────────────────────────────────────────────── */

const profileSchema = z.object({
  full_name: z.string().min(2, "שם חייב להכיל לפחות 2 תווים").max(60),
  phone:     z.string().max(20).optional().or(z.literal("")),
});
type ProfileData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "סיסמה נוכחית נדרשת"),
    newPassword: z
      .string()
      .min(8, "לפחות 8 תווים")
      .regex(/[A-Z]/, "חייב אות גדולה")
      .regex(/[0-9]/, "חייב ספרה"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });
type PasswordData = z.infer<typeof passwordSchema>;

/* ─── Nav items ───────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { id: "profile",    label: "פרופיל",       icon: User    },
  { id: "security",   label: "אבטחה",         icon: Shield  },
  { id: "appearance", label: "מראה",          icon: Palette },
  { id: "danger",     label: "מחיקת חשבון",  icon: Trash2  },
] as const;

/* ─── Section card ────────────────────────────────────────────────────────── */

function Section({
  id, icon: Icon, title, description, danger = false, children,
}: {
  id:          string;
  icon:        React.ElementType;
  title:       string;
  description: string;
  danger?:     boolean;
  children:    React.ReactNode;
}) {
  return (
    <Card
      id={id}
      className={cn(
        "border-border/50 scroll-mt-6",
        danger && "border-destructive/30"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5 text-base">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            danger ? "bg-destructive/10" : "bg-primary/10"
          )}>
            <Icon className={cn("w-4 h-4", danger ? "text-destructive" : "text-primary")} />
          </div>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

export function SettingsClient({ user }: { user: SupabaseUser }) {
  const router   = useRouter();
  const supabase = createClient();
  const { theme, setTheme } = useTheme();

  const [showCurrent,   setShowCurrent]   = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [deleteInput,   setDeleteInput]   = useState("");
  const [deleting,      setDeleting]      = useState(false);

  const displayName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const phone       = (user.user_metadata?.phone      as string | undefined) ?? "";

  /* ── Profile ──────────────────────────────────────────────────────────── */

  const {
    register: rp,
    handleSubmit: hp,
    formState: { isSubmitting: savingP, isDirty: dirtyP, errors: ep },
  } = useForm<ProfileData>({
    resolver:      zodResolver(profileSchema),
    defaultValues: { full_name: displayName, phone },
  });

  const onProfileSave = async (data: ProfileData) => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: data.full_name, phone: data.phone || null },
    });
    if (error) { toast.error("שגיאה בעדכון הפרופיל"); return; }
    toast.success("הפרופיל עודכן!");
    router.refresh();
  };

  /* ── Password ─────────────────────────────────────────────────────────── */

  const {
    register: rpw,
    handleSubmit: hpw,
    reset: resetPw,
    formState: { isSubmitting: savingPw, errors: epw },
  } = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSave = async (data: PasswordData) => {
    // Verify current password first
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email:    user.email!,
      password: data.currentPassword,
    });
    if (authErr) { toast.error("הסיסמה הנוכחית שגויה"); return; }

    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) { toast.error("שגיאה בעדכון הסיסמה"); return; }

    toast.success("הסיסמה עודכנה!");
    resetPw();
  };

  /* ── Logout ──────────────────────────────────────────────────────────── */

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("התנתקת בהצלחה");
    router.push("/login");
  };

  /* ── Delete account ───────────────────────────────────────────────────── */

  const handleDelete = async () => {
    setDeleting(true);
    await supabase.auth.signOut();
    toast("החשבון נמחק", { description: "כל הנתונים הוסרו מהמערכת" });
    router.push("/login");
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">הגדרות</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          נהל את הפרופיל והעדפות האפליקציה שלך
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Sidebar nav ──────────────────────────────────────────────── */}
        <nav className="lg:w-52 flex-shrink-0 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                id === "danger"
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}

          <Separator className="my-2" />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            התנתקות
          </button>
        </nav>

        {/* ── Sections ─────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* ── Profile ──────────────────────────────────────────────── */}
          <Section id="profile" icon={User} title="פרופיל" description="שם תצוגה, אימייל וטלפון">

            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {getInitials(displayName || user.email || "?")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold leading-tight">{displayName || "—"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
              </div>
            </div>

            <Separator />

            <form onSubmit={hp(onProfileSave)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">שם מלא</Label>
                  <Input
                    id="full_name"
                    placeholder="ישראל ישראלי"
                    className={cn("h-10", ep.full_name && "border-destructive")}
                    {...rp("full_name")}
                  />
                  {ep.full_name && (
                    <p className="text-xs text-destructive">{ep.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">טלפון</Label>
                  <Input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    placeholder="050-0000000"
                    className="h-10"
                    {...rp("phone")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>אימייל</Label>
                <Input
                  value={user.email ?? ""}
                  disabled
                  dir="ltr"
                  className="h-10 bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  כתובת האימייל לא ניתנת לשינוי ישיר
                </p>
              </div>

              <Button
                type="submit"
                disabled={savingP || !dirtyP}
                className="gap-2"
              >
                {savingP
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save    className="w-4 h-4" />
                }
                {savingP ? "שומר..." : "שמור שינויים"}
              </Button>
            </form>
          </Section>

          {/* ── Security ─────────────────────────────────────────────── */}
          <Section id="security" icon={Shield} title="אבטחה" description="שינוי סיסמת הכניסה">
            <form onSubmit={hpw(onPasswordSave)} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">סיסמה נוכחית</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    dir="ltr"
                    className={cn("h-10 pl-10", epw.currentPassword && "border-destructive")}
                    {...rpw("currentPassword")}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {epw.currentPassword && (
                  <p className="text-xs text-destructive">{epw.currentPassword.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">סיסמה חדשה</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      dir="ltr"
                      placeholder="לפחות 8 תווים"
                      className={cn("h-10 pl-10", epw.newPassword && "border-destructive")}
                      {...rpw("newPassword")}
                    />
                    <button
                      type="button" tabIndex={-1}
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {epw.newPassword && (
                    <p className="text-xs text-destructive">{epw.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">אישור סיסמה</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    dir="ltr"
                    placeholder="חזור על הסיסמה"
                    className={cn("h-10", epw.confirmPassword && "border-destructive")}
                    {...rpw("confirmPassword")}
                  />
                  {epw.confirmPassword && (
                    <p className="text-xs text-destructive">{epw.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={savingPw} variant="outline" className="gap-2">
                {savingPw
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Shield  className="w-4 h-4" />
                }
                {savingPw ? "מעדכן..." : "עדכן סיסמה"}
              </Button>
            </form>
          </Section>

          {/* ── Appearance ───────────────────────────────────────────── */}
          <Section id="appearance" icon={Palette} title="מראה" description="בחר ערכת צבעים מועדפת">
            <div className="space-y-3">
              <Label>ערכת צבעים</Label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "light",  label: "בהיר",  preview: "☀️" },
                  { value: "dark",   label: "כהה",   preview: "🌙" },
                  { value: "system", label: "מערכת", preview: "🖥️" },
                ] as const).map(({ value, label, preview }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      "relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border-2 transition-all",
                      theme === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/60 hover:bg-muted/30"
                    )}
                  >
                    {theme === value && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-2xl">{preview}</span>
                    <span className={cn(
                      "text-sm font-medium",
                      theme === value ? "text-primary" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Danger zone ──────────────────────────────────────────── */}
          <Section
            id="danger"
            icon={Trash2}
            title="מחיקת חשבון"
            description="פעולה זו בלתי הפיכה — כל הנתונים יימחקו לצמיתות"
            danger
          >
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">
                ⚠️ מחיקת חשבון תסיר לצמיתות:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>כל הלידים ופרטי הקשר</li>
                <li>היסטוריית שיחות ואינטראקציות</li>
                <li>משימות ותזכורות</li>
                <li>כל ההגדרות והנתונים</li>
              </ul>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 mt-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                מחק את החשבון שלי
              </Button>
            </div>
          </Section>

        </div>
      </div>

      {/* ── Delete confirmation dialog ─────────────────────────────── */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o: boolean) => { setDeleteOpen(o); if (!o) setDeleteInput(""); }}
      >
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              מחיקת חשבון לצמיתות
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                כדי לאשר, הקלד בדיוק:{" "}
                <span className="font-mono font-bold text-foreground">
                  מחק את החשבון שלי
                </span>
              </p>
              <Input
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="מחק את החשבון שלי"
                className={cn(
                  "h-10",
                  deleteInput.length > 0 &&
                    deleteInput !== "מחק את החשבון שלי" &&
                    "border-destructive"
                )}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteInput !== "מחק את החשבון שלי" || deleting}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2  className="w-4 h-4" />
              }
              מחק לצמיתות
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
