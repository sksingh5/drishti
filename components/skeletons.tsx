"use client";

export function StatCardSkeleton() {
  return (
    <div
      className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4"
      style={{ background: "var(--dicra-surface)" }}
    >
      <div className="h-3 w-20 rounded bg-[var(--dicra-border)] animate-pulse mb-3" />
      <div className="h-7 w-16 rounded bg-[var(--dicra-border)] animate-pulse" />
    </div>
  );
}

export function IndicatorCardSkeleton() {
  return (
    <div
      className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] overflow-hidden"
      style={{ background: "var(--dicra-surface)" }}
    >
      {/* Title bar */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: "var(--dicra-surface-muted)" }}>
        <div className="h-3 w-3 rounded-full bg-[var(--dicra-border)] animate-pulse" />
        <div className="h-3 w-24 rounded bg-[var(--dicra-border)] animate-pulse" />
      </div>
      {/* Score area */}
      <div className="p-4">
        <div className="h-10 w-14 rounded bg-[var(--dicra-border)] animate-pulse mb-3" />
        <div className="h-2.5 w-full rounded bg-[var(--dicra-border)] animate-pulse mb-2" />
        <div className="h-2.5 w-3/4 rounded bg-[var(--dicra-border)] animate-pulse" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div
      className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] w-full animate-pulse"
      style={{ background: "var(--dicra-surface-muted)", height: 480 }}
    />
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--dicra-border)]">
      <div className="h-3 w-8 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-40 rounded bg-[var(--dicra-border)] animate-pulse flex-1" />
      <div className="h-3 w-16 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-12 rounded bg-[var(--dicra-border)] animate-pulse" />
    </div>
  );
}

export function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="h-3 w-12 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-2 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-20 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-2 rounded bg-[var(--dicra-border)] animate-pulse" />
      <div className="h-3 w-28 rounded bg-[var(--dicra-border)] animate-pulse" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      {/* Left: Name + Score */}
      <div
        className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
        style={{ background: "var(--dicra-surface)" }}
      >
        <div className="h-3 w-24 rounded bg-[var(--dicra-border)] animate-pulse mb-2" />
        <div className="h-6 w-44 rounded bg-[var(--dicra-border)] animate-pulse mb-5" />
        <div className="h-3 w-32 rounded bg-[var(--dicra-border)] animate-pulse mb-2" />
        <div className="h-12 w-20 rounded bg-[var(--dicra-border)] animate-pulse" />
      </div>
      {/* Right: Metadata grid */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-4 flex flex-col justify-center"
            style={{ background: "var(--dicra-surface)" }}
          >
            <div className="h-2.5 w-14 rounded bg-[var(--dicra-border)] animate-pulse mb-2" />
            <div className="h-5 w-16 rounded bg-[var(--dicra-border)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendChartSkeleton() {
  return (
    <div
      className="rounded-[var(--dicra-radius-lg)] border border-[var(--dicra-border)] p-5"
      style={{ background: "var(--dicra-surface)" }}
    >
      <div className="h-3 w-28 rounded bg-[var(--dicra-border)] animate-pulse mb-4" />
      <div className="h-48 w-full rounded bg-[var(--dicra-border)] animate-pulse" />
    </div>
  );
}
