"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter }  from "next/navigation";
import { toast }      from "sonner";

/* ─── Shortcut registry ──────────────────────────────────────────────────── */

interface ShortcutOptions {
  /** Called when ⌘N / Ctrl+N is pressed */
  onNewLead?: () => void;
  /** Called when ⌘L / Ctrl+L is pressed (Log call) */
  onLogCall?: () => void;
  /** Called when ⌘T / Ctrl+T is pressed (New task) */
  onNewTask?: () => void;
}

/**
 * useKeyboardShortcuts
 *
 * Global keyboard shortcuts for LeadFlow.
 * Mount this hook once at the dashboard layout level.
 *
 * Shortcuts:
 *   ⌘N  / Ctrl+N   → Navigate to /leads/new
 *   ⌘L  / Ctrl+L   → Trigger log-call action
 *   ⌘T  / Ctrl+T   → Trigger new-task action
 *   ⌘/  / Ctrl+/   → Show shortcuts help toast
 *   ?               → Show shortcuts help toast
 */
export function useKeyboardShortcuts(options: ShortcutOptions = {}) {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = ["INPUT","TEXTAREA","SELECT"].includes(tag) ||
        (e.target as HTMLElement).isContentEditable;

      const meta = e.metaKey || e.ctrlKey;

      // ⌘N — New lead
      if (meta && e.key === "n") {
        e.preventDefault();
        options.onNewLead?.();
        router.push("/leads/new");
        return;
      }

      // ⌘L — Log call
      if (meta && e.key === "l") {
        e.preventDefault();
        options.onLogCall?.();
        return;
      }

      // ⌘T — New task
      if (meta && e.key === "t") {
        e.preventDefault();
        options.onNewTask?.();
        return;
      }

      // ? or ⌘/ — Help
      if (!isTyping && (e.key === "?" || (meta && e.key === "/"))) {
        e.preventDefault();
        showShortcutsHelp();
        return;
      }

      // G + L — Go to Leads (vim-style navigation, only when not typing)
      if (!isTyping && e.key === "g") {
        const next = (e2: KeyboardEvent) => {
          const navMap: Record<string, string> = {
            l: "/leads",
            c: "/calls",
            t: "/tasks",
            d: "/",
            s: "/settings",
          };
          const path = navMap[e2.key];
          if (path) {
            e2.preventDefault();
            router.push(path);
          }
          window.removeEventListener("keydown", next);
        };
        window.addEventListener("keydown", next, { once: true });
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router, options.onNewLead, options.onLogCall, options.onNewTask]);
}

/* ─── Help toast ─────────────────────────────────────────────────────────── */

function showShortcutsHelp() {
  toast(
    <div className="space-y-2 text-sm" dir="rtl">
      <p className="font-semibold mb-3">קיצורי מקלדת</p>
      {[
        ["⌘N",  "ליד חדש"],
        ["⌘L",  "תעד שיחה"],
        ["⌘T",  "משימה חדשה"],
        ["⌘K",  "חיפוש מהיר"],
        ["G → L", "לידים"],
        ["G → C", "שיחות"],
        ["G → D", "דאשבורד"],
        ["G → S", "הגדרות"],
        ["?",   "עזרה"],
      ].map(([key, label]) => (
        <div key={key} className="flex items-center justify-between gap-6">
          <span className="text-muted-foreground">{label}</span>
          <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">
            {key}
          </kbd>
        </div>
      ))}
    </div>,
    { duration: 6000 }
  );
}

/* ─── ShortcutsProvider — mount once at layout level ────────────────────── */

interface ShortcutsProviderProps {
  children: ReactNode;
}

export function ShortcutsProvider({ children }: ShortcutsProviderProps) {
  useKeyboardShortcuts();
  return <>{children}</>;
}
