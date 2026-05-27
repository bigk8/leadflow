export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-muted" />
        <div className="h-4 w-64 rounded-lg bg-muted" />
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted" />
          ))}
        </div>
        <div className="flex-1 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 p-6 space-y-4">
              <div className="h-5 w-24 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
