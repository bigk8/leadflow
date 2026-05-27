"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Phone,
  TrendingUp,
  BarChart3,
  Bell,
  CheckSquare,
  Settings,
  LogOut,
  ChevronRight,
  Zap,
  Star,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";

/* ─── Nav config ────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { href: "/",          label: "דאשבורד",    icon: LayoutDashboard },
  { href: "/leads",     label: "לידים",      icon: Users           },
  { href: "/favorites", label: "מועדפים",    icon: Star            },
  { href: "/calls",     label: "שיחות",      icon: Phone           },
  { href: "/pipeline",  label: "פייפליין",   icon: TrendingUp      },
  { href: "/tasks",     label: "משימות",     icon: CheckSquare     },
  { href: "/reminders", label: "תזכורות",    icon: Bell            },
  { href: "/reports",   label: "דוחות",      icon: BarChart3       },
] as const;

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface SidebarProps {
  user: User;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function Sidebar({ user }: SidebarProps) {
  const pathname                    = usePathname();
  const router                      = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "משתמש";

  /* ── Close mobile menu on navigation ────────────────────────────────────── */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* ── helpers ──────────────────────────────────────────────────────────── */

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("שגיאה בהתנתקות");
      setLoggingOut(false);
      return;
    }
    toast.success("התנתקת בהצלחה");
    router.push("/login");
    router.refresh();
  };

  /* ── shared link element ──────────────────────────────────────────────── */

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg text-sm font-medium",
          "transition-colors duration-150",
          collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
          active
            ? "bg-sidebar-accent text-sidebar-foreground"
            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        <Icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0",
            active
              ? "text-sidebar-primary"
              : "text-sidebar-foreground/50"
          )}
        />
        {!collapsed && (
          <>
            <span className="flex-1 whitespace-nowrap">{label}</span>
            {active && (
              <span className="w-1.5 h-1.5 rounded-full bg-sidebar-primary flex-shrink-0" />
            )}
          </>
        )}
      </Link>
    );
  };

  /* ── render ───────────────────────────────────────────────────────────── */

  return (
    <TooltipProvider delayDuration={0}>
      {/* ──────────── Mobile hamburger button ────────────────────────────────── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={cn(
          "fixed top-4 left-4 z-40 md:hidden",
          "p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent",
          "border border-sidebar-border text-sidebar-foreground",
          "transition-colors duration-150"
        )}
        aria-label={mobileOpen ? "סגור תפריט" : "פתח תפריט"}
      >
        {mobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* ──────────── Mobile overlay ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ──────────── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "relative flex flex-col h-screen",
          "bg-sidebar border-l border-sidebar-border",
          "transition-[width] duration-300 ease-in-out flex-shrink-0 overflow-hidden",
          "fixed md:relative inset-y-0 right-0 z-30 md:z-auto",
          "md:w-[240px]",
          mobileOpen ? "w-[240px]" : "w-0 md:w-[240px]",
          collapsed && "md:w-[64px]"
        )}
      >
        {/* ──────────── Logo ──────────────────────────────────────────────── */}
        <button
          onClick={() => router.push("/")}
          className={cn(
            "flex items-center gap-3 h-16 px-4 border-b border-sidebar-border flex-shrink-0",
            "transition-colors duration-150 hover:bg-sidebar-accent/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "cursor-pointer bg-transparent border-0"
          )}
          title="חזור לדאשבורד"
        >
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm flex-shrink-0">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground whitespace-nowrap">
              LeadFlow
            </span>
          )}
        </button>

        {/* ──────────── Collapse toggle ────────────────────────────────────── */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "הרחב סרגל" : "כווץ סרגל"}
          className={cn(
            "absolute -left-3 top-[72px] z-20",
            "w-6 h-6 rounded-full flex items-center justify-center",
            "bg-sidebar border border-sidebar-border shadow-sm",
            "text-sidebar-foreground/60 hover:text-sidebar-foreground",
            "transition-colors duration-150"
          )}
        >
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-300",
              !collapsed && "rotate-180"
            )}
          />
        </button>

        {/* ──────────── Navigation ─────────────────────────────────────────── */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) =>
            collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {/* div wrapper needed — TooltipTrigger requires a single child */}
                  <div><NavLink {...item} /></div>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              <NavLink key={item.href} {...item} />
            )
          )}
        </nav>

        {/* ──────────── Bottom ─────────────────────────────────────────────── */}
        <div className="px-2 py-3 border-t border-sidebar-border space-y-0.5 flex-shrink-0">

          {/* Settings */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Link
                    href="/settings"
                    className="flex items-center justify-center rounded-lg py-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                  >
                    <Settings className="w-[18px] h-[18px]" />
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>הגדרות</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              <span>הגדרות</span>
            </Link>
          )}

          {/* User row */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 mt-1",
              collapsed ? "justify-center" : "bg-sidebar-accent/30"
            )}
          >
            {/* Avatar — always visible */}
            <Avatar className="w-8 h-8 flex-shrink-0 ring-2 ring-sidebar-border">
              <AvatarFallback className="bg-sidebar-primary text-white text-xs font-bold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Name + logout — only when expanded */}
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-sidebar-foreground truncate leading-tight">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-sidebar-foreground/50 truncate leading-tight mt-0.5">
                    {user.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="התנתק"
                  className={cn(
                    "flex-shrink-0 p-1.5 rounded-md transition-colors",
                    "text-sidebar-foreground/40",
                    "hover:text-red-400 hover:bg-red-400/10",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
