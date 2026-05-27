"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Error boundary ─────────────────────────────────────────────────────── */

interface Props {
  children:  ReactNode;
  fallback?: ReactNode;
  label?:    string;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary ${this.props.label ?? ""}]`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {this.props.label ? `שגיאה ב-${this.props.label}` : "אירעה שגיאה"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            {this.state.error?.message ?? "שגיאה לא ידועה. נסה לרענן את הדף."}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={this.handleRetry}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            נסה שוב
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ─── Convenience wrapper for Next.js error.tsx files ────────────────────── */

interface PageErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
  title?: string;
}

export function PageError({ error, reset, title = "שגיאה בטעינת הדף" }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-2 max-w-md">
        {error.message ?? "אנא נסה לרענן את הדף. אם הבעיה נמשכת, פנה לתמיכה."}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
          קוד שגיאה: {error.digest}
        </p>
      )}
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        נסה שוב
      </Button>
    </div>
  );
}
