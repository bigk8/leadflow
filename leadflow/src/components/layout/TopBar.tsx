"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Bell, Moon, Sun, X, Monitor } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

/* ─── Theme Toggle ──────────────────────────────────────────────────────── */

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes renders on client only — avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" disabled>
        <Sun className="w-4 h-4 opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  // Cycle: light → dark → system
  const cycleTheme = () => {
    if (theme === "light")  return setTheme("dark");
    if (theme === "dark")   return setTheme("system");
    return setTheme("light");
  };

  const Icon =
    theme === "system"  ? Monitor :
    isDark              ? Moon    : Sun;

  const label =
    theme === "system"  ? "מצב מערכת"  :
    isDark              ? "מצב כהה"   : "מצב בהיר";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 text-muted-foreground hover:text-foreground"
      onClick={cycleTheme}
      title={`${label} — לחץ למעבר`}
    >
      <Icon className="w-4 h-4 transition-transform duration-200" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

/* ─── Props ─────────────────────────────────────────────────────────────── */

interface TopBarProps {
  user: User;
}

/* ─── TopBar ────────────────────────────────────────────────────────────── */

export function TopBar({ user }: TopBarProps) {
  const router = useRouter();
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "משתמש";

  /* ── ⌘K shortcut ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearchSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      // Navigate first, then clear (router.push is synchronous in Next.js)
      await router.push(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      clearSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchOpen(false);
    inputRef.current?.blur();
  };

  /* ── render ───────────────────────────────────────────────────────────── */

  return (
    <header className="h-16 flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm z-10">
      <div className="flex items-center gap-3 h-full px-6">

        {/* ── Search bar ─────────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative transition-all duration-200",
            searchOpen ? "flex-1 max-w-lg" : "w-64"
          )}
        >
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
            placeholder="חיפוש לידים, שיחות... (⌘K)"
            className={cn(
              "pr-9 h-9 text-sm transition-all duration-200",
              "bg-muted/50 border-transparent",
              "focus-visible:bg-background focus-visible:border-border",
              searchQuery && "pl-9"
            )}
          />
          {searchQuery && (
            <button
              onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Right side actions ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1 mr-auto">

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-muted-foreground hover:text-foreground relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
                <span className="sr-only">התראות</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-72">
              <DropdownMenuLabel className="font-semibold">התראות</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                אין התראות חדשות
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-5 mx-1" />

          {/* User dropdown */}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5",
                "hover:bg-accent transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}>
                <span className="text-sm font-medium hidden sm:block leading-none select-none">
                  {displayName.split(" ")[0]}
                </span>
                <Avatar className="w-8 h-8 ring-2 ring-border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold select-none">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" sideOffset={8} className="w-56">
              <div className="px-3 py-2.5">
                <p className="text-sm font-semibold leading-tight">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight truncate">
                  {user.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/settings">פרופיל והגדרות</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                asChild
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <a href="/login">התנתק</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
