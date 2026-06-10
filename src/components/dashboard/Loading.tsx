export function Loading({ label = "Loading live data…" }: { label?: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        {label}
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
      Couldn't load data from Google Sheets: {message}
    </div>
  );
}
